import { authMiddleware, AuthRequest, logout } from "../controllers/authController";
import { Request, Response } from "express";
import { Router } from "express";

const authRouter = Router();
// ---------------------------
// AUTHENTICATE CURRENT USER
// --------------------------
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
// LOGOUT

authRouter.post("/logout", logout);
// HEALTH CHECK

authRouter.get("/", (req: Request, res: Response) => {
  res.send("Auth OK");
});
//
module.exports = authRouter;