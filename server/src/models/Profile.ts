import mongoose, { Schema } from "mongoose";


export interface Profile {
  profileName: string,
	pin: string,
	progress: Record<string, any>,
	points : Number
}

export const ProfileSchema = new Schema<Profile>(
  {
    profileName: { type: String, required: true, trim: true },
    pin: { type: String, required: true },
    progress: { type: mongoose.Schema.Types.Mixed, default: {} },
    points: { type: Number, default: 0 },
  },
  { _id: false } //  prevents extra _id for each profile 
);

