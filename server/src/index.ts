/**
 * Project: Exclusive Drop API
 * Developer: Ilya ZeldnerBahaaElias
 */

import express, { Request, Response, NextFunction } from "express";
import mongoose, { Document, Schema } from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { register, login, sendResetPassCode, verifyPassCode, changePassword } from "./controllers/authController";

import { User } from "./models/User";
import { addProfile } from "./controllers/profileController";
import { verifyProfilePin } from "./controllers/profileController";

import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

// MIDDLEWARE
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());


app.use(cookieParser());

// ✅ CORS middleware — must be BEFORE your routes

app.use(
  cors({
    origin: "http://localhost:5001", // your frontend URL
    credentials: true,               // allow cookies to be sent
  })
);



app.use((req: Request, res: Response, next: NextFunction) => {
  res.set("Cache-Control", "no-store");
  next();
});

// DATABASE
const MONGO_URI = process.env.MONGO_URI || "";

if (!MONGO_URI) {
  console.error("❌ CRITICAL: MONGO_URI is missing from .env!");
} else {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ DB STATUS: Connected Successfully"))
    .catch((err: Error) =>
      console.error("❌ DB CONNECTION ERROR:", err.message)
    );
}

// RATE LIMITER (POST ONLY)
export const buyActionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many attempts. Please wait 1 minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

let profiles = require("./routes/profile.route");
app.use("/api/profiles",profiles);
app.use("/api/profiles/getEmailProfiles", profiles);

let auth = require("./routes/auth.route");
app.use("/api/authMe", auth);


app.post("/api/register", buyActionLimiter, register);
app.post("/api/login", buyActionLimiter, login)
//app.post("/api/profiles", buyActionLimiter, addProfile);
//app.post("/api/profiles/verify-pin", buyActionLimiter,verifyProfilePin);
app.post("/api/sendResetPassCode", buyActionLimiter,sendResetPassCode);
app.post("/api/verifyPassCode", buyActionLimiter,verifyPassCode);
app.post("/api/changePassword", buyActionLimiter, changePassword)

/*app.get("/api/profiles/:email", async (req: Request, res: Response) => {
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
});*/


app.get("/api/getAllUsers", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
    console.log(users);
  } catch (err) {
    res.status(500).json();
  }
});

// Listen on 127.0.0.1 to perfectly match Vite's proxy target
const PORT = 5001;
app.listen(PORT, "127.0.0.1", () => {
console.log(`🚀 BACKEND ACTIVE: http://127.0.0.1:${PORT}`);
});
//ELias Commit added