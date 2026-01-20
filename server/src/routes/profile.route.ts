import { buyActionLimiter } from "..";
import { addProfile, verifyProfilePin,updateProfilePin } from "../controllers/profileController";
import { Request, Response } from "express";
import { User } from "../models/User";
import { authMiddleware, AuthRequest } from "../controllers/authController";
import { getProfileQuestions, SetProfileAnswer } from "../controllers/gameController";


const express = require("express");
const profileRouter = express.Router();

/* =========================
   ADD PROFILE
========================= */
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
   הוספה: נתיב לעדכון PIN
   ============================================= */
profileRouter.put(
  "/update-pin",
  authMiddleware,
  buyActionLimiter,
  updateProfilePin
);
/* =============================================
   סיום הוספה
   ============================================= */

profileRouter.post(
  "/getQuestions",
  authMiddleware,
  buyActionLimiter,
  getProfileQuestions
);

profileRouter.post(
  "/saveAnswer",
  authMiddleware,
  buyActionLimiter,
  SetProfileAnswer
)

profileRouter.post(
  "/getProgress",
  authMiddleware,
  buyActionLimiter,
  getProfileProgress
)

import { getReportHistory } from "../controllers/profileController";

profileRouter.get("/report-history", getReportHistory);

/* =========================
   PROFILE PROGRESS SUMMARY
========================= */
profileRouter.get(
  "/:email/:profileName/progress-summary",
  authMiddleware,
  getProfileProgress
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
