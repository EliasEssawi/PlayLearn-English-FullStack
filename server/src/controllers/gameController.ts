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

export const getProfileQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { profileName, level, topic, type, numberOfQuestions = 5 } = req.body;

    if (!profileName || !level || !topic || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const profile = user.profiles.find((p) => p.profileName === profileName);
    if (!profile) {
      return res.status(404).json({ success: false, message: "There is no profile with this name" });
    }

    const answeredCorrectlyIds =
      profile.progress?.answers
        ?.filter(
          (a: any) =>
            a.correct === true &&
            a.topic === topic &&
            a.type === type &&
            a.level === level
        )
        .map((a: any) => new mongoose.Types.ObjectId(a.questionId)) || [];

    let questions = await Exercise.aggregate([
      {
        $match: {
          level,
          topic,
          type,
          _id: { $nin: answeredCorrectlyIds },
        },
      },
      { $sample: { size: numberOfQuestions } },
    ]);

    if (questions.length < numberOfQuestions) {
      const remaining = numberOfQuestions - questions.length;

      const extraQuestions = await Exercise.aggregate([
        {
          $match: {
            level,
            topic,
            type,
            _id: { $in: answeredCorrectlyIds },
          },
        },
        { $sample: { size: remaining } },
      ]);

      questions = questions.concat(extraQuestions);
    }

    return res.status(200).json({
      success: true,
      message: "Questions sent successfully",
      questions,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
};

export const SetProfileAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { profileName, questionId, topic, level, correct, answeredAt, timeSpentMs } = req.body;

    const exercise = await Exercise.findById(questionId);
    if (!exercise) {
      return res.status(404).json({ success: false, message: "Exercise not found" });
    }

    await User.updateOne(
      { _id: req.user!.userId, "profiles.profileName": profileName },
      {
        $push: {
          "profiles.$.progress.answers": {
            questionId: exercise._id,
            topic,
            level,
            type: exercise.type,
            correct,
            answeredAt: answeredAt ? new Date(answeredAt) : new Date(),
            timeSpentMs: timeSpentMs ?? 0,
          },
        },
      }
    );

    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const profile = user.profiles.find((p) => p.profileName === profileName);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const t = exercise.type;
    const key = `${String(topic)}|${String(t)}`;

    // ✅ count UNIQUE correct questionIds for this topic+type+level (safe casts)
    const correctSet = new Set(
      (profile.progress?.answers || [])
        .filter((a: any) =>
          String(a.topic) === String(topic) &&
          String(a.type) === String(t) &&
          Number(a.level) === Number(level) &&
          a.correct === true
        )
        .map((a: any) => String(a.questionId))
    );

    const correctUnique = correctSet.size;

    // ✅ IMPORTANT: store unlocked as PLAIN OBJECT, not Map
    if (!profile.progress) profile.progress = {};
    if (!profile.progress.unlocked) profile.progress.unlocked = {};

    let unlockedLevel = Number(profile.progress.unlocked[key] ?? 1);

    let justUnlocked = false;
    if (correctUnique >= 8 && unlockedLevel < Number(level) + 1) {
      unlockedLevel = Number(level) + 1;
      profile.progress.unlocked[key] = unlockedLevel;
      justUnlocked = true;
      await user.save();
    }

    return res.json({ success: true, correctUnique, unlockedLevel, justUnlocked });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
};


// ✅ NEW: load progress for frontend (persist across refresh)
export const getProfileProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { profileName } = req.body;

    if (!profileName) {
      return res.status(400).json({ success: false, message: "Missing profileName" });
    }

    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const profile = user.profiles.find((p) => p.profileName === profileName);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const unlocked = profile.progress?.unlocked || {};

    return res.json({ success: true, unlocked });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
};

