import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { AuthRequest } from "./authController";
import { Exercise } from "../models/Exercise";
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

    if(user.profiles.some(profile => profile.profileName === profileName))
    {
      return res.status(404).json({
        success: false,
        message: "There is a profile with this name",
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

/* =============================================
   הוספה: פונקציה לעדכון PIN של פרופיל קיים
   ============================================= */
export const updateProfilePin = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { profileName, newPin } = req.body;

    // ולידציה בסיסית
    if (!profileName || !newPin || newPin.length !== 4) {
      return res.status(400).json({
        success: false,
        message: "Valid profile name and 4-digit PIN are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // מציאת הפרופיל בתוך המערך של המשתמש
    const profileIndex = user.profiles.findIndex(
      (p) => p.profileName === profileName
    );

    if (profileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // הצפנת ה-PIN החדש
    const hashedPin = await bcrypt.hash(newPin, 10);
    
    // עדכון ה-PIN
    // הוספת סימן קריאה (!) אחרי user מבטיחה ל-TS שהאובייקט קיים
if (user && user.profiles[profileIndex]) {
    user.profiles[profileIndex].pin = hashedPin;
}

    await user.save();

    return res.status(200).json({
      success: true,
      message: "PIN updated successfully",
    });
  } catch (err) {
    console.error("Update PIN error:", err);
    return res.status(500).json({
      success: false,
      message: "Database error during PIN update",
    });
  }
};
/* =============================================
   סיום הוספה
   ============================================= */




export const getReportHistory = async (req: Request, res: Response) => {
  try {
    const { email, profileName } = req.query;

    if (!email || !profileName) {
      return res.status(400).json({ success: false, message: "Missing params" });
    }

    const parent = await User.findOne({ email });
    if (!parent) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const profile = parent.profiles.find(
      (p) => p.profileName === profileName
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const history = await Promise.all(
      profile.progress.map(async (p: any) => {
        const exercise = await Exercise.findById(p.questionId);
        return {
          ...p,
          exercise,
        };
      })
    );

    res.json({ success: true, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
