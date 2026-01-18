/**
 * Project: Exclusive Drop API
 * Developer: Ilya ZeldnerBahaaElias
 */

import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { User } from "./models/User";
import { Exercise } from "./models/Exercise";

// ✅ Create app FIRST
const app = express();

// --------------------
// Middleware
// --------------------
app.use(helmet());
app.use(morgan("dev"));


const allowedOrigins = [
  "http://localhost:5173",
  "https://webproject-plum.vercel.app",
  "https://webproject-5n1kxaupz-elias-projects-826243b3.vercel.app/"
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      cb(null, allowedOrigins.includes(origin));
    },
    credentials: true
  })
);


app.use(express.json());
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.set("Cache-Control", "no-store");
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


// Listen on 127.0.0.1 to perfectly match Vite's proxy target

//ELias Commit added