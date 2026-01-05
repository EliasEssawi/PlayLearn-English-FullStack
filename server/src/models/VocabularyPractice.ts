import mongoose, { Schema, Document } from "mongoose";
import { Profile, ProfileSchema } from "./Profile";  

// TYPES
export interface IVocabularyPractice extends Document {
  word: string;
  correct: string;
  rate: number;
  
}



const VocabularyPracticeSchema = new Schema<IVocabularyPractice>({
  word: { type: String, required: true, trim: true },

  correct: {
    type: String,
    required: true,
  },

  rate: { 
    type: Number,
     required: true }
    });


export const VocabularyPractice = mongoose.model<IVocabularyPractice>("Vocabulary", VocabularyPracticeSchema);