import { buyActionLimiter } from "..";
import { addProfile, verifyProfilePin } from "../controllers/profileController";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { authMiddleware } from "../controllers/authController";

const express = require('express');
const profileRouter = express.Router();
//const profile = require('../models/ProfileSchema');

//  IMPORTANT !!!!!!
//  use authMiddleware, buyActionLimiter in this order for POST requests
//  and just authMiddleware for any GET req thats after login
//  also use AuthRequest in the function (like addProfile) for any request thats after login
profileRouter.post("/", authMiddleware, buyActionLimiter, addProfile);
profileRouter.post("/verify-pin", authMiddleware, buyActionLimiter,verifyProfilePin);

profileRouter.get("/:email", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    console.log("email check 1")
    // ✅ Type guard (חובה)
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    console.log("email check 2")
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    console.log("email check 3")
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

profileRouter.get("/", (req:Request, res:Response) => {
  res.send("Profiles OK");
});

module.exports = profileRouter;