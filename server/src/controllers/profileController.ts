import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { AuthRequest } from "./authController";

/* =========================
   ADD PROFILE
========================= */
export const addProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const { profileName, pin, rate } = req.body;

    /* ✅ validation */
    if (!profileName || !pin || rate === undefined) {
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

    if (rate < 1 || rate > 5) {
      return res.status(400).json({
        success: false,
        message: "Rate must be between 1 and 5",
      });
    }

    const user = await User.findById(userId);
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
      rate, // ✅ מגיע מה־frontend
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile added successfully",
      profiles: user.profiles,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

/* =========================
   VERIFY PROFILE PIN
========================= */
export const verifyProfilePin = async (req: Request, res: Response) => {
  try {
    const { email, profileName, pin } = req.body;

    console.log(" email: " +email + ", profileName: " + profileName, ", pin: " + pin);

    if (!profileName || !pin) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const userId = (req as any).user?.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (profileName === "parent")
    {
      console.log("checking parent pin");
      //const isMatch = await bcrypt.compare(pin, user.pin);
      const isMatch = pin === user.pin;
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Parent Invalid PIN",
        });
      }

      return res.status(200).json({
        success: true,
        profile: {
          profileName: profileName,
          role: "parent",
          points: 0,
          rate: 0,
          progress: null,
        },
      });
    }

    const profile = user.profiles.find(
      (p) => p.profileName === profileName
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const isMatch = await bcrypt.compare(pin, profile.pin);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid PIN",
      });
    }

    return res.status(200).json({
      success: true,
      profile: {
        profileName: profile.profileName,
        role: "child",
        points: profile.points,
        rate: profile.rate,
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
