import mongoose, { Schema } from "mongoose";

export interface Profile {
  profileName: string;
  pin: string;
  progress: Record<string, any>;
  points: number;
  rate: number;   // ✅ חדש
}

export const ProfileSchema = new Schema<Profile>(
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
);

