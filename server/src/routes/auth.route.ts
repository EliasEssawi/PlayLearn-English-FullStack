import { authMiddleware, AuthRequest } from "../controllers/authController";
import { Request, Response, NextFunction } from "express";

const express = require('express');
const authRouter = express.Router();

authRouter.get("/me", authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    user: {
      email: req.user!.email,
      userId: req.user!.userId,
    },
  });
});