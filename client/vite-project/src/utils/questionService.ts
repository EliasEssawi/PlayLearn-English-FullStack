// services/questionService.ts
import axios from "axios";

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
    "/api/questions/profile", // adjust your endpoint
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
