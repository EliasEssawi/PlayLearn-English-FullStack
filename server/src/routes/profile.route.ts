import { buyActionLimiter } from "..";
import { addProfile, verifyProfilePin } from "../controllers/profileController";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { authMiddleware } from "../controllers/authController";

const express = require('express');
const profileRouter = express.Router();
const profile = require('../models/ProfileSchema');

//  IMPORTANT !!!!!!
//  use authMiddleware, buyActionLimiter in this order for POST requests
//  and just authMiddleware for any GET req thats after login
//  also use AuthRequest in the function (like addProfile) for any request thats after login
profileRouter.post("/", authMiddleware, buyActionLimiter, addProfile);
profileRouter.post("/verify-pin", authMiddleware, buyActionLimiter,verifyProfilePin);

profileRouter.get("/:email", async (req: Request, res: Response) => {
  try {
    const email = req.params.email;

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


module.exports = profileRouter;