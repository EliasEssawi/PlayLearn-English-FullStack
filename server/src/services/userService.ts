import { User, IUser } from "../models/User";
import crypto from "crypto";
// Check if a user exists in the database by email

export async function checkUserExists(email: string): Promise<boolean> {
  const exists = await User.findOne({ email });
  return exists ? true : false;
}
// Retrieve a user document by email

export async function GetUser(email: string): Promise<IUser | null> {
  const user = await User.findOne({ email });
  return user;
}

/**
 * Verify reset code and return the user if valid.
 * Returns null if code is invalid, expired, or missing.
 */
export async function verifyUserResetCode(email: string, code?: string): Promise<IUser | null> {
  
   // Reject empty codes immediately
  if (!code || code === "") 
  {
    return null
  }
  
  // Hash the code (matches how it’s stored in DB)
  const hashedCode = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");

  //Verify the code (and expiration)
  const user = await User.findOne({
    email,
    resetCode: { $exists: true, $eq: hashedCode },
    resetCodeExpiresAt: { $exists: true, $gt: new Date() },
  });

  return user; // User document or null
}
