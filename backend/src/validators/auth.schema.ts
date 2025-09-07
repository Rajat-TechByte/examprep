// src/validators/auth.schema.ts
import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 chars"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 chars"),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 chars"),
});
export type LoginInput = z.infer<typeof loginSchema>;