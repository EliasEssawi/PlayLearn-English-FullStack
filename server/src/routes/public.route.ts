import { buyActionLimiter } from "..";
import {
  register,
  login,
  sendResetPassCode,
  verifyPassCode,
  changePassword,
} from "../controllers/authController";

const express = require("express");
const publicRouter = express.Router();


// ---------------------------
// Public routes (NO auth)
// ---------------------------
publicRouter.post("/register", buyActionLimiter, register);
publicRouter.post("/login", buyActionLimiter, login);
publicRouter.post("/sendResetPassCode", buyActionLimiter, sendResetPassCode);
publicRouter.post("/verifyPassCode", buyActionLimiter, verifyPassCode);
publicRouter.post("/changePassword", buyActionLimiter, changePassword);

module.exports = publicRouter;
