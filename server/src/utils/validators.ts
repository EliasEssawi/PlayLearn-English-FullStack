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

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .regex(emailRegex, { message: "Please enter a valid email address" }),

  password: z.string()
});

export const ChangePassSchema = z.object({
  newPassword: z
    .string()
    .trim()
    .regex(passwordRegex, {
      message:
        "Password must contain at least one uppercase letter and one lowercase letter",
    }),

    email: z
    .string()
    .trim()
    .regex(emailRegex, { message: "Please enter a valid email address" }),
  
    code: z.string().optional()
});