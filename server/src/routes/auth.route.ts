import { authMiddleware, AuthRequest, logout } from "../controllers/authController";
import { Request, Response } from "express";
import { Router } from "express";

const authRouter = Router();

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

authRouter.post("/logout", logout);

authRouter.get("/", (req: Request, res: Response) => {
  res.send("Auth OK");
});

module.exports = authRouter;