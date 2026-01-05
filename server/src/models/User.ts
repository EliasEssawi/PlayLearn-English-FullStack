import mongoose, { Schema, Document } from "mongoose";
import { Profile, ProfileSchema } from "./Profile";  

// TYPES
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  pin: string;
  dateOfBirth: Date;
  createdAt: Date;
  profiles: Profile[];
  resetCode?: string | undefined;
  resetCodeExpiresAt?: Date | undefined;
}



const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: { type: String, required: true },

  pin: { type: String, required: true },

  dateOfBirth: { type: Date, required: true },

  createdAt: { type: Date, default: Date.now },

  profiles: {
    type: [ProfileSchema],
    default: [],      // important!
    required: true
  },

  resetCode: {
    type: String,
    default: undefined,
    required: false
  },

  resetCodeExpiresAt: {
    type: Date,
    default: undefined,
    required: false
  },
});

export const User = mongoose.model<IUser>("User", UserSchema);