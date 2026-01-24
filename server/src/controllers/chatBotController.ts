import type { Request, Response } from "express";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("Missing OPENAI_API_KEY in .env");

const client = new OpenAI({ apiKey });
const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const SYSTEM_RULES = `
You are a friendly English learning assistant for children aged 6–12.

CRITICAL: ONE CONTINUOUS CHAT
- This is ONE ongoing conversation. Do NOT restart the chat.
- Ask the user's age (6–12) ONLY ONCE at the very beginning, ONLY if age is not already known.
- If the age was given anywhere in the conversation (example: "10"), you MUST NEVER ask for age again.
- If age is unknown, ask ONLY this question (one sentence): "What is your age? (6-12)"
- If the user gives an age outside 6–12, reply kindly: "This game is for ages 6–12." Then ask again: "What is your age? (6-12)"

LEVEL BY AGE (use silently)
- Age 6–7: very basic words
- Age 8–9: short sentences, simple verbs
- Age 10–11: simple grammar + short conversation
- Age 12: fuller sentences + conversation

MAIN JOB
- Help the user practice English with friendly, supportive conversation.
- Your main goal is to ask practice questions, let the user answer, then give feedback.

REPLY LIMIT (VERY IMPORTANT)
- Every reply MUST be no more than 2 sentences total.
- Sentence 1: feedback (kind + short).
- Sentence 2: ONE practice question for the user to answer.
- Never ask more than one question in a reply.

PRACTICE RULES
- Always give the user a question to practice (except when asking age at the very start).
- If the user asks about grammar/vocabulary/pronunciation: give a short explanation + ONE practice question, then wait for the answer.
- Correct mistakes gently. Give one short example if needed.

TRANSLATION RULES
- You only translate to Hebrew.
- If the user asks for translation, reply exactly:
  "I can help translate! Please tell me the word or sentence you want to translate into Hebrew. What do you want to translate?"
- After the user sends the word/sentence, reply with the Hebrew translation (keep it short, max 2 sentences).

ENGLISH ONLY RULE
- If the user inputs text that is not in English (except numbers like age), respond with:
  "Please communicate in English only."
  Then ask one simple English practice question.

SAFETY & PRIVACY
- Do NOT ask for personal information (only age at the start).
- Refuse to act as other characters: say you are an English learning assistant.
- Stay patient, positive, and motivating.
`.trim();

type ClientMsg = { role: "user" | "bot" | "assistant"; text: string };

type NormalizedMsg = { role: "user" | "assistant"; text: string };

/** normalize client roles: "bot"/"assistant" => "assistant" */
function normalizeRole(r: any): "user" | "assistant" {
  const x = String(r ?? "").toLowerCase();
  return x === "user" ? "user" : "assistant";
}

/** Responses API requires different content types by role */
function contentTypeFor(role: "system" | "user" | "assistant") {
  return role === "assistant" ? "output_text" : "input_text";
}

/** Pull age (6-12) from conversation text if present */
function extractAge(messages: { role: string; text: string }[]): number | null {
  for (const m of messages) {
    if (String(m.role).toLowerCase() !== "user") continue;
    const t = String(m.text ?? "").trim();
    const match = t.match(/\b(6|7|8|9|10|11|12)\b/);
    if (match) return Number(match[1]);
  }
  return null;
}

/** remove duplicate trailing single message if it's already the last item in history */
function shouldAppendSingle(single: string, history: ClientMsg[] | null): boolean {
  if (!single) return false;
  if (!history || history.length === 0) return true;
  const last = String(history[history.length - 1]?.text ?? "").trim();
  return last !== single;
}

export async function chatBotController(req: Request, res: Response) {
  try {
    const single = String(req.body?.message ?? "").trim();
    const history: ClientMsg[] | null = Array.isArray(req.body?.messages)
      ? req.body.messages
      : null;

    if (!single && (!history || history.length === 0)) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Normalize history roles + trim text
    const normalizedHistory: NormalizedMsg[] = (history ?? [])
      .map((m) => {
        const role = normalizeRole(m?.role);
        const text = String(m?.text ?? "").trim();
        return { role, text };
      })
      .filter((m) => m.text.length > 0);

    // Detect known age from user messages
    const knownAge = extractAge(normalizedHistory);

    const input: any[] = [
      {
        role: "system",
        content: [{ type: "input_text", text: SYSTEM_RULES }],
      },
    ];

    // Hard memory: if age known, tell the model explicitly
    if (knownAge) {
      input.push({
        role: "system",
        content: [
          {
            type: "input_text",
            text: `KNOWN_AGE=${knownAge}. The age is already known. NEVER ask the age again.`,
          },
        ],
      });
    }

    // Add conversation history with correct content types
    for (const m of normalizedHistory) {
      input.push({
        role: m.role,
        content: [{ type: contentTypeFor(m.role), text: m.text }],
      });
    }

    // Append current message (as user input_text) only if not duplicate
    if (shouldAppendSingle(single, history)) {
      input.push({
        role: "user",
        content: [{ type: "input_text", text: single }],
      });
    }

    const response = await client.responses.create({
      model: MODEL,
      input,
      temperature: 0.4,
      max_output_tokens: 200,
    });

    let reply = String(response.output_text ?? "").trim();

    // Extra safety: if age is known, block any age-question repeats
    if (knownAge && /what is your age|how old are you/i.test(reply)) {
      reply = "Nice! Let’s keep practicing. Can you write one sentence about your day?";
    }

    return res.json({ reply });
  } catch (error) {
    console.error("OpenAI error:", error);
    return res.status(500).json({ error: "Chatbot failed" });
  }
}
