// models/Exercise.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IExercise extends Document {
  level: number;
  topic: string;
  type: string;
  prompt: string;
  options: string[];
  answer: string;
}

const ExerciseSchema: Schema = new Schema({
  level: { type: Number, required: true },
  topic: { type: String, required: true },
  type: { type: String, required: true },
  prompt: { type: String, required: true },
  options: [{ type: String, required: true }],
  answer: { type: String, required: true },
});

export const Exercise = mongoose.model<IExercise>("Exercise", ExerciseSchema);
