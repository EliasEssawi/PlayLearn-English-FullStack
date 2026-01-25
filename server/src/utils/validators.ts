import { email, z } from "zod";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z]).{8,}$/;
const pinRegex = /^\d{4}$/;
// ZOD VALIDATION
export const RegisterSchema = z.object({
  name: z.string().trim().min(2),
  
  email: z
    .string()
    .trim()
    .regex(emailRegex, { message: "Please enter a valid email address" }),
  
  password: z
    .string()
    .trim()
    .regex(passwordRegex, {
      message:
        "Password must contain at least one uppercase letter and one lowercase letter",
    }),

  pin: z
    .string()
    .regex(pinRegex, { message: "PIN must be exactly 4 digits" }),

  dateOfBirth: z.coerce.date(),
});
// Schema for user login validation

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .regex(emailRegex, { message: "Please enter a valid email address" }),

  password: z.string()
});
// Schema for password change validation

export const ChangePassSchema = z.object({
    // New password with strength validation

  newPassword: z
    .string()
    .trim()
    .regex(passwordRegex, {
      message:
        "Password must contain at least one uppercase letter and one lowercase letter",
    }),
  // User email validation

    email: z
    .string()
    .trim()
    .regex(emailRegex, { message: "Please enter a valid email address" }),
    // Optional verification/reset code

    code: z.string().optional()
});