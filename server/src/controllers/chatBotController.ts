import type { Request, Response } from "express";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("Missing OPENAI_API_KEY in .env");

const client = new OpenAI({ apiKey });
const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

// -------------------- PROMPT --------------------
const SYSTEM_RULES = `
You are a friendly English learning assistant for children aged 6–12.

ABSOLUTE RULES
- This is ONE ongoing conversation (no resets).
- Ask age ONLY if it is unknown. Ask it only once.
- After age is known, ask ONCE what the user wants to practice (translate/grammar/complete/fill/mixed).
- If user asks their own question (translate/explain/meaning), answer it briefly then continue with ONE MCQ.

AGE QUESTION (only if unknown)
- Ask exactly: "What is your age? (6-12)"
- If outside 6–12: say "This game is for ages 6–12." then ask again.

PRACTICE TYPE (ask only once after age is known)
- Ask: "What do you want to practice? Translate (English→Hebrew), Grammar, Complete sentence, Fill in the blank, or Mixed?"
- Use the chosen type for the next MCQ questions.

GAME MODE (MCQ)
- Ask ONE multiple-choice question at a time with 4 options A–D.
- Wait for the user’s answer.
- The user may answer with: A/B/C/D OR by typing the option text.

IMPORTANT: DO NOT REVEAL THE CORRECT ANSWER BEFORE THE USER ANSWERS
- When you ask a NEW question, do NOT show the correct answer.
- Only after the user answers, you may reveal the correct letter.

REPLY FORMAT (when age is known)
You MUST reply in exactly this structure:

Feedback RULES (VERY IMPORTANT)
- If the user is CORRECT: do NOT reveal the correct answer letter. 
- If the user is WRONG: reveal the correct answer letter. Write "Correct: X".
Feedback: <short feedback if correct, or "Correct: X" if wrong>
Question: <question text>
A) <option>
B) <option>
C) <option>
D) <option>

ENGLISH ONLY
- If the user writes non-English (except numbers like age), say:
  "Please communicate in English only."
  Then ask the next MCQ.

DIFFICULTY BY AGE (silently)
- 6–7: very basic
- 8–9: short sentences
- 10–11: simple grammar
- 12: fuller sentences
`.trim();

// -------------------- TYPES --------------------
type ClientMsg = { role: "user" | "bot" | "assistant"; text: string };
type NormalizedMsg = { role: "user" | "assistant"; text: string };
type PracticeType = "translate" | "grammar" | "complete" | "fill" | "mixed";
type ChoiceLetter = "A" | "B" | "C" | "D";

// -------------------- SERVER MEMORY --------------------
const sessions = new Map<
  string,
  {
    messages: NormalizedMsg[];
    age: number | null;
    practiceType: PracticeType | null;
    lastCorrect: ChoiceLetter | null; // ✅ NEW
  }
>();

function normalizeRole(r: any): "user" | "assistant" {
  const x = String(r ?? "").toLowerCase();
  return x === "user" ? "user" : "assistant";
}
function isPracticeTypeAnswer(single: string): boolean {
  return !!extractPracticeType(single);
}
function contentTypeFor(role: "system" | "user" | "assistant") {
  return role === "assistant" ? "output_text" : "input_text";
}

function extractAge(messages: { role: string; text: string }[]): number | null {
  for (const m of messages) {
    if (String(m.role).toLowerCase() !== "user") continue;
    const t = String(m.text ?? "").trim();
    const match = t.match(/\b(6|7|8|9|10|11|12)\b/);
    if (match) return Number(match[1]);
  }
  return null;
}

function shouldAppendSingle(single: string, history: NormalizedMsg[]): boolean {
  if (!single) return false;
  if (!history || history.length === 0) return true;
  const last = String(history[history.length - 1]?.text ?? "").trim();
  return last !== single;
}

function hasAgeQuestionAlready(history: NormalizedMsg[]): boolean {
  return history.some(
    (m) => m.role === "assistant" && /what is your age\?\s*\(6-12\)/i.test(m.text)
  );
}

function extractPracticeType(text: string): PracticeType | null {
  const t = text.toLowerCase();
  if (t.includes("translate")) return "translate";
  if (t.includes("grammar")) return "grammar";
  if (t.includes("complete")) return "complete";
  if (t.includes("fill")) return "fill";
  if (t.includes("mixed")) return "mixed";
  return null;
}

function hasPracticeTypeQuestion(history: NormalizedMsg[]): boolean {
  return history.some(
    (m) => m.role === "assistant" && /what do you want to practice\?/i.test(m.text)
  );
}

function extractCorrectLetter(reply: string): ChoiceLetter | null {
  const match = /Correct:\s*([ABCD])/i.exec(reply);
  if (!match) return null;

  const letter = match[1];
  return letter ? (letter.toUpperCase() as ChoiceLetter) : null;
}


/**
 * Soft MCQ wrapper (NO leaking).
 * Only used when we expect an MCQ but model didn't format it.
 */
function softEnsureMcq(reply: string, practiceType: PracticeType | null): string {
  const t = String(reply ?? "").trim();
  const ok =
    /^feedback:/i.test(t) &&
    /(^|\n)question:/i.test(t) &&
    /(^|\n)A\)/.test(t) &&
    /(^|\n)B\)/.test(t) &&
    /(^|\n)C\)/.test(t) &&
    /(^|\n)D\)/.test(t);

  if (ok) return t;

  // better fallback per type (still no leaking)
  if (practiceType === "translate") {
    return `Feedback: Okay! Correct: -
Question: Translate to Hebrew: "dog"
A) כלב
B) חתול
C) בית
D) ספר`;
  }

  if (practiceType === "grammar") {
    return `Feedback: Okay! Correct: -
Question: Choose the correct sentence.
A) He go to school.
B) He goes to school.
C) He going to school.
D) He goed to school.`;
  }

  if (practiceType === "fill") {
    return `Feedback: Okay! Correct: -
Question: Fill in the blank: I ___ a book.
A) am
B) is
C) have
D) has`;
  }

  if (practiceType === "complete") {
    return `Feedback: Okay! Correct: -
Question: Complete the sentence: She is ___.
A) happy
B) run
C) chair
D) eat`;
  }

  // mixed/default
  return `Feedback: Okay! Correct: -
Question: Which word is a fruit?
A) apple
B) table
C) car
D) shoe`;
}


/** If assistant says user is correct, remove any leaked correct letter */
function stripCorrectLetterWhenUserCorrect(reply: string): string {
  const t = String(reply ?? "");
  // if it sounds like "correct", we don't want to reveal the answer letter
  if (/that is correct|correct!|nice work|well done|excellent|perfect|great job/i.test(t)) {
    return t.replace(/Correct:\s*[ABCD]/i, "Correct: -");
  }
  return t;
}

export async function chatBotController(req: Request, res: Response) {
  try {
    const single = String(req.body?.message ?? "").trim();
    const incomingHistory: ClientMsg[] | null = Array.isArray(req.body?.messages)
      ? req.body.messages
      : null;
    const sessionId = String(req.body?.sessionId ?? "").trim();

    if (!single && (!incomingHistory || incomingHistory.length === 0) && !sessionId) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 1) Load session (if exists)
    let baseHistory: NormalizedMsg[] = [];
    let knownAge: number | null = null;
    let practiceType: PracticeType | null = null;
    let lastCorrect: ChoiceLetter | null = null;

    if (sessionId && sessions.has(sessionId)) {
      const s = sessions.get(sessionId)!;
      baseHistory = [...s.messages];
      knownAge = s.age ?? null;
      practiceType = s.practiceType ?? null;
      lastCorrect = s.lastCorrect ?? null;
    }

    // 2) Normalize client history
    const normalizedClientHistory: NormalizedMsg[] = (incomingHistory ?? [])
      .map((m) => ({
        role: normalizeRole(m?.role),
        text: String(m?.text ?? "").trim(),
      }))
      .filter((m) => m.text.length > 0);

    // Use client history if provided, else server session history
    const mergedHistory =
      normalizedClientHistory.length > 0 ? normalizedClientHistory : baseHistory;

    // 3) Detect age if needed
    if (!knownAge) knownAge = extractAge(mergedHistory);

    // -------------------------
    // HARD AGE GATE (NO MODEL)
    // -------------------------
    const ageAsked = hasAgeQuestionAlready(mergedHistory);

    if (!knownAge && !ageAsked) {
      const reply = "What is your age? (6-12)";
      const updatedMessages = [...mergedHistory];

      if (shouldAppendSingle(single, mergedHistory) && single) {
        updatedMessages.push({ role: "user", text: single });
      }
      updatedMessages.push({ role: "assistant", text: reply });

      if (sessionId) {
        sessions.set(sessionId, {
          messages: updatedMessages,
          age: null,
          practiceType: null,
          lastCorrect: null,
        });
      }

      return res.json({ reply, messages: updatedMessages, age: null, practiceType: null });
    }

    if (!knownAge) {
      const reply = "This game is for ages 6–12. What is your age? (6-12)";
      const updatedMessages = [...mergedHistory];

      if (shouldAppendSingle(single, mergedHistory) && single) {
        updatedMessages.push({ role: "user", text: single });
      }
      updatedMessages.push({ role: "assistant", text: reply });

      if (sessionId) {
        sessions.set(sessionId, {
          messages: updatedMessages,
          age: null,
          practiceType: null,
          lastCorrect: null,
        });
      }

      return res.json({ reply, messages: updatedMessages, age: null, practiceType: null });
    }

    // -------------------------
    // PRACTICE TYPE GATE (NO MODEL)
    // -------------------------
    if (!practiceType) {
      const detected = extractPracticeType(single);
      if (detected) practiceType = detected;
    }

    const practiceAsked = hasPracticeTypeQuestion(mergedHistory);

    if (knownAge && !practiceType && !practiceAsked) {
      const reply =
        "What do you want to practice?\n" +
        "Translate (English→Hebrew), Grammar, Complete sentence, Fill in the blank, or Mixed?";

      const updatedMessages = [...mergedHistory];

      if (shouldAppendSingle(single, mergedHistory) && single) {
        updatedMessages.push({ role: "user", text: single });
      }
      updatedMessages.push({ role: "assistant", text: reply });

      if (sessionId) {
        sessions.set(sessionId, {
          messages: updatedMessages,
          age: knownAge,
          practiceType: null,
          lastCorrect,
        });
      }

      return res.json({ reply, messages: updatedMessages, age: knownAge, practiceType: null });
    }

    // Save practice type if chosen
    if (sessionId) {
      const prev =
        sessions.get(sessionId) ??
        ({ messages: mergedHistory, age: knownAge, practiceType: null, lastCorrect: null } as const);

      sessions.set(sessionId, {
        ...prev,
        age: knownAge,
        practiceType: practiceType ?? prev.practiceType,
      });
    }

    // -------------------------
    // BUILD INPUT FOR OPENAI
    // -------------------------
    const input: any[] = [
      { role: "system", content: [{ type: "input_text", text: SYSTEM_RULES }] },
      {
        role: "system",
        content: [{ type: "input_text", text: `KNOWN_AGE=${knownAge}. Age is known. NEVER ask again.` }],
      },
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              `IMPORTANT: Randomize which option (A/B/C/D) is correct. ` +
              `Do NOT keep the correct answer in the same letter repeatedly. ` +
              (lastCorrect ? `The last correct letter was ${lastCorrect}; avoid using ${lastCorrect} as the correct answer next time if possible.` : ""),
          },
        ],
      },
    ];

    if (practiceType) {
      input.push({
        role: "system",
        content: [
          {
            type: "input_text",
            text: `PRACTICE_TYPE=${practiceType}. Use this type for MCQ questions unless the user asks something else.`,
          },
        ],
      });
    }

    for (const m of mergedHistory) {
      input.push({
        role: m.role,
        content: [{ type: contentTypeFor(m.role), text: m.text }],
      });
    }

    if (shouldAppendSingle(single, mergedHistory)) {
      input.push({
        role: "user",
        content: [{ type: "input_text", text: single }],
      });
    }

    // 5) Call OpenAI
    const response = await client.responses.create({
      model: MODEL,
      input,
      temperature: 0.55, // slightly higher = more variety (helps reduce "always B")
      max_output_tokens: 250,
    });

    let reply = String(response.output_text ?? "").trim();

    // block any age repeats
    if (/what is your age|how old are you/i.test(reply)) {
      reply = `Feedback: Nice! Correct: -
Question: Choose the correct sentence.
A) I am happy.
B) I happy am.
C) Happy I am.
D) Am I happy.`;
    }

    // ✅ Only show correct letter if user is wrong (if assistant says correct → hide letter)
    reply = stripCorrectLetterWhenUserCorrect(reply);

    // If it contains "Correct: A/B/C/D" but user didn't answer A/B/C/D, remove leak
    const userLooksLikeChoice = /^[abcd]$/i.test(single.trim());
    if (!userLooksLikeChoice) {
      reply = reply.replace(/Correct:\s*[ABCD]/i, "");
    }

    // Soft format ensure
    if (!isPracticeTypeAnswer(single)) {
  reply = softEnsureMcq(reply, practiceType);
}
    // -------------------------
    // UPDATE HISTORY
    // -------------------------
    const updatedMessages: NormalizedMsg[] = [...mergedHistory];

    if (shouldAppendSingle(single, mergedHistory) && single) {
      updatedMessages.push({ role: "user", text: single });
    }
    updatedMessages.push({ role: "assistant", text: reply });

    // ✅ Update lastCorrect from reply (if present)
    const newCorrect = extractCorrectLetter(reply);

    if (sessionId) {
      const prev =
        sessions.get(sessionId) ??
        ({ messages: updatedMessages, age: knownAge, practiceType: practiceType ?? null, lastCorrect: null } as const);

      sessions.set(sessionId, {
        ...prev,
        messages: updatedMessages,
        age: knownAge,
        practiceType: practiceType ?? prev.practiceType,
        lastCorrect: newCorrect ?? prev.lastCorrect,
      });
    }

    return res.json({
      reply,
      messages: updatedMessages,
      age: knownAge,
      practiceType: practiceType ?? null,
    });
  } catch (error) {
    console.error("OpenAI error:", error);
    return res.status(500).json({ error: "Chatbot failed" });
  }
}
