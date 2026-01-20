// services/questionService.ts
import axios from "axios";
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
   
export interface Question {
  _id: string;
  level: number;
  topic: string;
  type: string;
  prompt: string;
  options: string[];
  answer: string;
}

export interface GetQuestionsResponse {
  success: boolean;
  message: string;
  questions: Question[];
}

export const getProfileQuestions = async (
  profileName: string,
  level: number,
  topic: string,
  type: string,
  numberOfQuestions: number = 5
): Promise<GetQuestionsResponse> => {
 const response = await axios.post<GetQuestionsResponse>(
  `${API_BASE}/profiles/getQuestions`,
  {
    profileName,
    level,
    topic,
    type,
    numberOfQuestions,
  },
  { withCredentials: true }
);


  return response.data;
};

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

export const saveProgress = async (payload: SaveProgressPayload) => {
  const res = await axios.post(
    `${API_BASE}/profiles/saveAnswer`,
    payload,
    {
      withCredentials: true, // ✅ for cookies auth
    }
  );

  return res.data;
};

export const getProgress = async (profileName: string) => {
  const res = await axios.post(
    `${API_BASE}/profiles/getProgress`,
    { profileName },
    { withCredentials: true }
  );
  return res.data; // { success, unlocked }
};

