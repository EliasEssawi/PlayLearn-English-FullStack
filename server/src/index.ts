/**
 * Project: Exclusive Drop API
 * Developer: Ilya ZeldnerBahaaElias
 */

import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { User } from "./models/User";
import { Exercise } from "./models/Exercise";

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development",
});


const app = express();
app.set("trust proxy", 1);
// --------------------
// Middleware
// --------------------
app.use(helmet());
app.use(morgan("dev"));

// ✅ IMPORTANT: must be before routes
app.use(
  cors({
    origin: (origin, cb) => {
      // allow server-to-server / curl / render health checks
      if (!origin) return cb(null, true);

      // ✅ Allowed exact origins (NO path here!)
      const allowedExact = new Set<string>([
        "http://localhost:5173",
        "http://localhost:3005",
        "https://webproject-coral.vercel.app"
        // add your main production client here if you have it
      ]);
      

      // ✅ allow all your Vercel preview deployments
      const isVercelPreview = /^https:\/\/webproject-.*\.vercel\.app$/.test(origin);

      const allowed = allowedExact.has(origin) || isVercelPreview;

      return cb(null, allowed);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);



app.use(express.json());
app.use(cookieParser());

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});


// --------------------
// Database
// --------------------
const MONGO_URI = process.env.MONGO_URI || "";

if (!MONGO_URI) {
  console.error("CRITICAL: MONGO_URI is missing from .env!");
} else {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ DB STATUS: Connected Successfully"))
    .catch((err: Error) => console.error("❌ DB CONNECTION ERROR:", err.message));
}
// ---------------------------
// Rate limiter (buy actions)
// ---------------------------
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
// --------------------
// Routes (CommonJS style)
// --------------------
const publicRouter = require("./routes/public.route");
const authRouter = require("./routes/auth.route");
const profileRouter = require("./routes/profile.route");
const chatbotRouter = require("./routes/chatbot.route");

app.use("/api/public", publicRouter);
app.use("/api/auth", authRouter);
app.use("/api/profiles", profileRouter);
app.use("/api/chatbot", chatbotRouter);

// --------------------
// Extra endpoints
// --------------------
app.get("/api/getAllUsers", async (_req, res) => {
  try {
    const users = await User.find();
    console.log(users);
    return res.status(200).json(users); 
  } catch {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/api/getAllQuestions", async (_req, res) => {
  try {
    const users = await Exercise.find();
    return res.status(200).json(users);
  } catch {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

// --------------------
// Server
// --------------------
const PORT = process.env.PORT || 5001;

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`BACKEND ACTIVE: http://0.0.0.0:${PORT}`);
});

