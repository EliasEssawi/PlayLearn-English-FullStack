import { authMiddleware, AuthRequest } from "../controllers/authController";
import { Request, Response, NextFunction } from "express";

const express = require('express');
const authRouter = express.Router();

authRouter.get("/authMe", authMiddleware, (req: AuthRequest, res: Response) => {
  console.log("found me");
  res.json({
    success: true,
    user: {
      email: req.user!.email,
      userId: req.user!.userId,
    },
  });
});


authRouter.get("/", (req:Request, res:Response) => {
  res.send("Profiles OK");
});

module.exports = authRouter;