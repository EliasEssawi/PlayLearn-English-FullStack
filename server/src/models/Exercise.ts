// models/Exercise.ts
import mongoose, { Schema, Document } from "mongoose";

// TypeScript interface representing an exercise/question document

export interface IExercise extends Document {
  level: number;
  topic: string;
  type: string;
  prompt: string;
  options: string[];
  answer: string;
}
// Mongoose schema defining the structure of an exercise

const ExerciseSchema: Schema = new Schema({
  level: { type: Number, required: true },
  topic: { type: String, required: true },
  type: { type: String, required: true },
  prompt: { type: String, required: true },
  options: [{ type: String, required: true }],
  answer: { type: String, required: true },
});
// Export Mongoose model bound to the "excersises" collection
export const Exercise = mongoose.model<IExercise>("Exercise", ExerciseSchema, "excersises");
