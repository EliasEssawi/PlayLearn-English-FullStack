import { buyActionLimiter } from "..";
import { addProfile, verifyProfilePin,updateProfilePin } from "../controllers/profileController";
import { Request, Response } from "express";
import { User } from "../models/User";
import { authMiddleware, AuthRequest } from "../controllers/authController";
import { getProfileQuestions, SetProfileAnswer, getProfileProgress} from "../controllers/gameController";

import { getProfileProgressSummary } from "../controllers/progressController";
import { getReportHistory } from "../controllers/profileController";


const express = require("express");
const profileRouter = express.Router();

/* =========================
   ADD PROFILE
========================= */
// Create a new profile for the authenticated user

profileRouter.post(
  "/",
  authMiddleware,
  buyActionLimiter,
  addProfile
);

/* =========================
   VERIFY PROFILE PIN
========================= */
profileRouter.post(
  "/verify-pin",
  authMiddleware,
  buyActionLimiter,
  verifyProfilePin
);
/* =============================================
   ADDITION: ROUTE TO UPDATE PROFILE PIN
   ============================================= */
profileRouter.put(
  "/update-pin",
  authMiddleware,
  buyActionLimiter,
  updateProfilePin
);

// Retrieve questions for a specific profile and level

profileRouter.post(
  "/getQuestions",
  authMiddleware,
  buyActionLimiter,
  getProfileQuestions
);
// Save an answer submitted by a profile

profileRouter.post(
  "/saveAnswer",
  authMiddleware,
  buyActionLimiter,
  SetProfileAnswer
)
// Get detailed progress data for a profile


profileRouter.post(
  "/getProgress",
  authMiddleware,
  buyActionLimiter,
  getProfileProgress
)


profileRouter.get("/report-history", getReportHistory);

/* =========================
   PROFILE PROGRESS SUMMARY
========================= */
profileRouter.get(
  "/:email/:profileName/progress-summary",
  authMiddleware,
  getProfileProgressSummary
);
/* =========================
   GET LOGGED-IN USER PROFILES
========================= */
profileRouter.get("/:email", authMiddleware, async (req: Request, res: Response) => {
  console.log("****"+req.params.email);
  try {
    const { email } = req.params;
  
    // ✅ Type guard (חובה)
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    return res.status(200).json({
      success: true,
      profiles: user.profiles || [],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
});

/* =========================
   HEALTH CHECK
========================= */
profileRouter.get("/ping", (_req: Request, res: Response) => {
  res.send("Profiles OK");
});

module.exports = profileRouter;
