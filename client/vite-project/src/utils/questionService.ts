// services/questionService.ts
import axios from "axios";
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
// QUESTION TYPES

export interface Question {
  _id: string;
  level: number;
  topic: string;
  type: string;
  prompt: string;
  options: string[];
  answer: string;
}
// Response structure for fetching questions
export interface GetQuestionsResponse {
  success: boolean;
  message: string;
  questions: Question[];

  
  available?: number;
  requested?: number;
  remaining?: number;
}
// Fetch questions for a specific profile, level, topic, and type

export const getProfileQuestions = async (
  profileName: string,
  level: number,
  topic: string,
  type: string,
  numberOfQuestions: number = 10
): Promise<GetQuestionsResponse> => {
  const response = await axios.post<GetQuestionsResponse>(
    `${API_BASE}/profiles/getQuestions`,
    { profileName, level, topic, type, numberOfQuestions },
    { withCredentials: true }
  );
  return response.data;
};
// Payload structure for saving user progress

type SaveProgressPayload = {
  profileName: string;
  questionId: string;
  topic: string;
  level: number;
  type: string;
  correct: boolean;
  answeredAt: string;
  timeSpentMs: number;
};
// Save an answered question and update profile progress

export const saveProgress = async (payload: SaveProgressPayload) => {
  const res = await axios.post(`${API_BASE}/profiles/saveAnswer`, payload, {
    withCredentials: true,
  });
  return res.data;
};
// Retrieve progress and unlocked levels for a profile

export const getProgress = async (profileName: string) => {
  const res = await axios.post(
    `${API_BASE}/profiles/getProgress`,
    { profileName },
    { withCredentials: true }
  );
  return res.data;
};
