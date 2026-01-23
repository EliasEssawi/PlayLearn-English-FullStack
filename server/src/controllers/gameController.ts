import { Response } from "express";
import { AuthRequest } from "./authController";
import { User } from "../models/User";
import mongoose from "mongoose";
import { Exercise } from "../models/Exercise";

interface AnsweredQuestion {
  questionId: string;
  correct: boolean;
  topic: string;
  level: number;
  type: string;
}

const norm = (x: any) => String(x ?? "").trim().toLowerCase();

export const getProfileQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { profileName, level, topic, type, numberOfQuestions = 10 } = req.body;

    if (!profileName || !level || !topic || !type) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const user = await User.findById(req.user!.userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const profile: any = (user.profiles || []).find((p: any) => p.profileName === profileName);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    const norm = (x: any) => String(x ?? "").trim().toLowerCase();

    const tTopic = norm(topic);
    const tType = norm(type);
    const lvl = Number(level);
    const size = Number(numberOfQuestions) || 10;

    // ✅ solved correct IDs for this lvl/topic/type
    const solvedIds = (profile.progress?.answers || [])
      .filter((a: any) =>
        a.correct === true &&
        norm(a.topic) === tTopic &&
        norm(a.type) === tType &&
        Number(a.level) === lvl
      )
      .map((a: any) => String(a.questionId))
      .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
      .map((id: string) => new mongoose.Types.ObjectId(id));

    const questions = await Exercise.aggregate([
      {
        $match: {
          level: lvl,
          topic: tTopic,
          type: tType,
          ...(solvedIds.length ? { _id: { $nin: solvedIds } } : {}),
        },
      },
      { $sample: { size } },
    ]);

    const totalRemaining = await Exercise.countDocuments({
      level: lvl,
      topic: tTopic,
      type: tType,
      ...(solvedIds.length ? { _id: { $nin: solvedIds } } : {}),
    });

    return res.status(200).json({
      success: true,
      message: "Questions sent successfully",
      questions,
      available: questions.length,
      requested: size,
      remaining: totalRemaining, // 
    });
  } catch (err) {
    console.error("getProfileQuestions ERROR:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
};



const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const SetProfileAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { profileName, questionId, topic, level, correct, answeredAt, timeSpentMs } = req.body;

    if (!profileName || !questionId || !topic || !level) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const exercise = await Exercise.findById(questionId).lean();
    if (!exercise) return res.status(404).json({ success: false, message: "Exercise not found" });

    const user = await User.findById(req.user!.userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const profile: any = (user.profiles || []).find((p: any) => p.profileName === profileName);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    const tTopic = norm(topic);
    const tType = norm(exercise.type); // source of truth from DB
    const lvl = Number(level);
    const qidStr = String(exercise._id);

    const answers: any[] = Array.isArray(profile.progress?.answers) ? profile.progress.answers : [];
    const unlockedObj: Record<string, number> = { ...(profile.progress?.unlocked || {}) };

    // ✅ do not save duplicate "correct" for same question in same lvl/topic/type
    const alreadyCorrect = answers.some((a: any) =>
      String(a.questionId) === qidStr &&
      norm(a.topic) === tTopic &&
      norm(a.type) === tType &&
      Number(a.level) === lvl &&
      a.correct === true
    );

    // ✅ rule:
    // - if alreadyCorrect and current attempt is correct => do not save
    // - otherwise save (wrong attempts can be saved)
    const shouldSave = !(alreadyCorrect && correct === true);

    const answerDoc = {
      questionId: exercise._id,
      topic: tTopic,
      level: lvl,
      type: tType,
      correct: !!correct,
      answeredAt: answeredAt ? new Date(answeredAt) : new Date(),
      timeSpentMs: Number(timeSpentMs) || 0,
    };

    // ✅ recompute correctUnique (unique correct IDs for this lvl/topic/type)
    const correctSet = new Set<string>(
      answers
        .filter((a: any) =>
          a.correct === true &&
          norm(a.topic) === tTopic &&
          norm(a.type) === tType &&
          Number(a.level) === lvl
        )
        .map((a: any) => String(a.questionId))
    );

    // if we are saving a new correct now, add it to set (avoid waiting for DB)
    if (shouldSave && correct === true) correctSet.add(qidStr);

    const correctUnique = correctSet.size;

    // ✅ unlock logic
    const key = `${tTopic}|${tType}`;
    const base = clamp(Number(profile.rate) || 1, 1, 5);
    let unlockedLevel = Math.max(Number(unlockedObj[key] ?? 1), base);

    const next = clamp(lvl + 1, 1, 5);
    let justUnlocked = false;

    if (correctUnique >= 8 && unlockedLevel < next) {
      unlockedLevel = next;
      justUnlocked = true;
    }

    unlockedObj[key] = unlockedLevel;

    // ✅ persist using updateOne (survives re-login)
    const update: any = {
      $set: { "profiles.$.progress.unlocked": unlockedObj },
    };
    if (shouldSave) {
      update.$push = { "profiles.$.progress.answers": answerDoc };
    }

    await User.updateOne(
      { _id: req.user!.userId, "profiles.profileName": profileName },
      update
    );

    return res.json({
      success: true,
      saved: shouldSave,
      alreadyCorrect,
      correctUnique,
      unlockedLevel,
      justUnlocked,
    });
  } catch (err) {
    console.error("SetProfileAnswer ERROR:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
};


export const getProfileProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { profileName } = req.body;

    if (!profileName) {
      return res.status(400).json({ success: false, message: "Missing profileName" });
    }

    const user = await User.findById(req.user!.userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const profile: any = (user.profiles || []).find((p: any) => p.profileName === profileName);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
    const base = clamp(Number(profile?.rate) || 1, 1, 5);

    const TOPICS = ["animals", "weather", "transportation", "jobs", "furniture", "colors"];
    const TYPES = ["translate", "complete", "listening", "talking", "reading"];

    const unlocked: Record<string, number> = { ...(profile.progress?.unlocked || {}) };

    let changed = false;
    for (const topic of TOPICS) {
      for (const type of TYPES) {
        const key = `${topic}|${type}`;
        const cur = Number(unlocked[key] ?? 0);
        if (cur < base) {
          unlocked[key] = base;
          changed = true;
        }
      }
    }

    // ✅ save safely with $set (no schema/subdoc save issues)
    if (changed) {
      await User.updateOne(
        { _id: req.user!.userId, "profiles.profileName": profileName },
        { $set: { "profiles.$.progress.unlocked": unlocked } }
      );
    }

    return res.json({ success: true, base, unlocked });
  } catch (err) {
    console.error("getProfileProgress ERROR:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
};


