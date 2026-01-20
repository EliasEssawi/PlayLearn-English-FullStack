import mongoose, { Schema } from "mongoose";

export interface Profile {
  profileName: string;
  pin: string;
  progress: Record<string, any>;
  points: number;
  rate: number;   // ✅ חדש
}

const AnswerSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Exercise", required: true },
    topic: { type: String, required: true },
    level: { type: Number, required: true },
    type: { type: String, required: true }, // translate/complete/listening/reading/talking
    correct: { type: Boolean, required: true },
    answeredAt: { type: Date, default: Date.now },
    timeSpentMs: { type: Number, default: 0 },
  },
  { _id: false }
);

export const ProfileSchema = new Schema<Profile>(
  {
    profileName: { type: String, required: true, trim: true },
    pin: { type: String, required: true },

    progress: {
      answers: { type: [AnswerSchema], default: [] },

      // unlocked levels per topic+type
      unlocked: { type: Map, of: Number, default: {} },
      // example key: "animals|talking" -> 2
    },

    points: { type: Number, default: 0 },
    rate: { type: Number, required: true, default: 1, min: 1, max: 5 },
  },
  { _id: false }
);


/*export const ProfileSchema = new Schema<Profile>(
  {
    profileName: { type: String, required: true, trim: true },
    pin: { type: String, required: true },
    progress: { type: mongoose.Schema.Types.Mixed, default: {} },
    points: { type: Number, default: 0 },
    rate: {
      type: Number,
      required: true,
      default:1,
      min: 1,
      max: 5,
    },
  },
  { _id: false }
);*/

