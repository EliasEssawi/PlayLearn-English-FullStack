import { Request, Response } from "express";
import { AuthRequest } from "./authController";
import { User } from "../models/User";
import mongoose from "mongoose";
import { Exercise } from "../models/Exercise";

interface AnsweredQuestion {
  questionId: string;
  correct: boolean;
}

export const getProfileQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { profileName, level, topic, type, numberOfQuestions = 5 } = req.body;

    /* ✅ validation */
    if (!profileName || !level || !topic || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profile = user.profiles.find(p => p.profileName === profileName);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "There is no profile with this name",
      });
    }

    // Get IDs of questions answered correctly    
    const answeredCorrectlyIds = profile.progress?.answered
    ?.filter((a: AnsweredQuestion) => a.correct)
    .map((a: AnsweredQuestion) => new mongoose.Types.ObjectId(a.questionId)) || [];

    // Step 1: Fetch questions NOT answered correctly
    let questions = await Exercise.aggregate([
      { $match: {
          level,
          topic,
          type,
          _id: { $nin: answeredCorrectlyIds },
        } 
      },
      { $sample: { size: numberOfQuestions } } // randomize
    ]);

    console.log("level: " + level + " topic: " + topic + " type: " + type);

    // Step 2: If not enough, include some already answered correctly
    if (questions.length < numberOfQuestions) {
      const remaining = numberOfQuestions - questions.length;

      const extraQuestions = await Exercise.aggregate([
        { $match: {
            level,
            topic,
            type,
            _id: { $in: answeredCorrectlyIds },
          } 
        },
        { $sample: { size: remaining } }
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
    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

export const SetProfileAnswer = async (req: AuthRequest, res: Response) => {
  const {
    profileName,
    questionId,
    topic,
    level,
    correct,
    answeredAt,
    timeSpentMs,
  } = req.body;

  const exercise = await Exercise.findById(questionId);
  if (!exercise) {
    return res.status(404).json({ success: false, message: "Exercise not found" });
  }

  await User.updateOne(
    {
      _id: req.user!.userId,
      "profiles.profileName": profileName,
    },
    {
      $push: {
        "profiles.$.progress": {
          questionId: exercise._id,
          topic,
          level,
          type: exercise.type,   // ✅ כאן התיקון
          correct,
          answeredAt: new Date(answeredAt),
          timeSpentMs,
        },
      },
    }
  );

  res.json({ success: true });
};
