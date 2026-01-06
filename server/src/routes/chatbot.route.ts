import { chatBotController } from "../controllers/chatBotController";
import { Request, Response } from "express";

const express = require("express");
const chatbotRouter = express.Router();

/**
 * POST /api/chatbot
 */
chatbotRouter.post("/", chatBotController);

module.exports = chatbotRouter;
