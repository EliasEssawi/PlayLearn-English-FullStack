import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import { RegisterSchema, LoginSchema, ChangePassSchema } from "../utils/validators";
import crypto from "crypto";
import { verifyUserResetCode } from "../services/userService";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../services/mailService";
import jwt from "jsonwebtoken";
import type { CookieOptions } from "express";


export function generateCode(length = 8): string {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .replace(/[^A-Z0-9]/gi, "")
    .slice(0, length)
    .toUpperCase();
}


function isProductionEnv(req?: Request): boolean {
  const nodeEnvProd = process.env.NODE_ENV === "production";
  const renderProd = process.env.RENDER === "true";
  const vercelProd = process.env.VERCEL === "1";

  const xfProto = req?.headers["x-forwarded-proto"];
  const httpsByReq =
    !!req &&
    (req.secure ||
      xfProto === "https" ||
      (Array.isArray(xfProto) && xfProto[0] === "https"));

  return nodeEnvProd || renderProd || vercelProd || httpsByReq;
}

function getCookieOptions(req?: Request): CookieOptions {
 
  const opts: CookieOptions = {
    httpOnly: true,
    secure: true,                  // must be true when sameSite is "none"
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 1000,
  };

  return opts;
}



/**
 * REGISTER
 */
export const register = async (req: Request, res: Response) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);

    if (!parsed.success) {
      console.log("REGISTER VALIDATION:", parsed.error.issues);
      return res
        .status(400)
        .json({ success: false, message: parsed.error.issues[0]?.message });
    }

    const { name, email, password, pin, dateOfBirth } = parsed.data;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      pin,
      dateOfBirth,
      profiles: [],
    });

    await user.save();

    // Send welcome email (do NOT block response)
    sendWelcomeEmail(email, name)
      .then((mail) => {
        console.log("WELCOME MAIL RESULT:", mail);
        if (!mail.ok) console.error("Sign Up Mail Failed To Send.", mail.error);
      })
      .catch((e) => console.error("Sign Up Mail Threw Error:", e));

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (err: any) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, message });
  }
};

/**
 * LOGIN
 */
export const login = async (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return res.status(400).json({
        success: false,
        message: firstError?.message,
      });
    }

    const { email, password } = parsed.data;

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(401).json({
        success: false,
        message: "User doesn't exist",
      });
    }

    const valid = await bcrypt.compare(password, userData.password);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ success: false, message: "Missing JWT_SECRET" });
    }

    const token = jwt.sign(
      { userId: String(userData._id), email: userData.email },
      jwtSecret,
      { expiresIn: "1h" }
    );

    const cookieOptions = getCookieOptions(req);

    // Helpful debug (no secret, no token printed)
    console.log("LOGIN SET COOKIE:", {
      origin: req.headers.origin,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      host: req.headers.host,
      xfProto: req.headers["x-forwarded-proto"],
    });

    res.cookie("authToken", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (err: any) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, message });
  }
};

interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * AUTH MIDDLEWARE
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.authToken;

  // Debug: tells you EXACTLY what the server received
  console.log("AUTH CHECK:", {
    path: req.path,
    origin: req.headers.origin,
    cookieHeader: req.headers.cookie ? "present" : "missing",
    parsedCookies: req.cookies ? Object.keys(req.cookies) : "no-cookie-parser?",
    hasAuthToken: Boolean(token),
    xfProto: req.headers["x-forwarded-proto"],
  });

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized (no cookie)" });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return res.status(500).json({ success: false, message: "Missing JWT_SECRET" });

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = decoded;
    return next();
  } catch (e: any) {
    // Token expired / invalid / wrong secret
    console.log("JWT VERIFY FAILED:", e?.name || "Error");
    return res.status(401).json({ success: false, message: "Unauthorized (invalid token)" });
  }
};

/**
 * SEND RESET PASSWORD CODE (EMAIL)
 */
export const sendResetPassCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(400).json({
        success: false,
        message: "User doesn't exist",
      });
    }

    const code = generateCode();
    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

    await User.updateOne(
      { email },
      { resetCode: hashedCode, resetCodeExpiresAt: new Date(Date.now() + 3 * 60 * 1000) }
    );

    const mail = await sendPasswordResetEmail(email, code);
    console.log("RESET MAIL RESULT:", mail);
    if (!mail.ok) console.error("Reset Code Failed To Send.", mail.error);

    return res.status(200).json({
      success: true,
      message: "Verification code sent to email",
    });
  } catch (err: any) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, message });
  }
};

/**
 * VERIFY RESET CODE
 */
export const verifyPassCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    const user = await verifyUserResetCode(email, code);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }

    return res.status(200).json({ success: true, message: "Code verified" });
  } catch (err: any) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, message });
  }
};

/**
 * CHANGE PASSWORD
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const parsed = ChangePassSchema.safeParse(req.body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return res.status(400).json({ success: false, message: firstError?.message });
    }

    const { email, newPassword, code } = parsed.data;

    const user = await verifyUserResetCode(email, code);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = undefined;
    user.resetCodeExpiresAt = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err: any) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, message });
  }
};

/**
 * LOGOUT
 */
export const logout = (req: Request, res: Response) => {
  const cookieOptions = getCookieOptions(req);

  // clearCookie must match sameSite/secure/path used when setting cookie
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};