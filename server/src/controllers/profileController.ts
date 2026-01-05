 import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { AuthRequest } from "./authController";


/* =========================
   ADD PROFILE (קיים)
========================= */
//use AuthRequest for any request thats after login
export const addProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId; // 
    const { email, profileName, pin } = req.body;

    if (!email || !profileName || !pin) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (pin.length !== 4) {
      return res.status(400).json({
        success: false,
        message: "PIN must be 4 digits",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPin = await bcrypt.hash(pin, 10);

    user.profiles.push({
      profileName,
      pin: hashedPin,
      progress: {},
      points: 0,
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile added successfully",
      profiles: user.profiles,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};
export const verifyProfilePin = async (req: Request, res: Response) => {
  try {
    const { email, profileName, pin } = req.body;

    if (!email || !profileName || !pin) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* ===========================
       ✅ PARENT PIN CHECK
    =========================== */
    if (profileName === "Parent") {
      if (pin !== user.pin) {
        return res.status(401).json({
          success: false,
          message: "Invalid PIN",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Parent PIN verified",
        profile: {
          profileName: "Parent",
          role: "parent",
        },
      });
    }

    /* ===========================
       👶 CHILD PROFILE PIN CHECK
    =========================== */
    const profile = user.profiles.find(
      (p) => p.profileName === profileName
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    if (pin !== profile.pin) {
      return res.status(401).json({
        success: false,
        message: "Invalid PIN",
      });
    }

    return res.status(200).json({
      success: true,
      message: "PIN verified",
      profile: {
        profileName: profile.profileName,
        role: "child",
        points: profile.points,
        progress: profile.progress,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};
