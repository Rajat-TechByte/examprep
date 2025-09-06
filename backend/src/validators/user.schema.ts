// src/validators/user.schema.ts
import { z } from "zod";

/**
 * Define allowed roles explicitly with z.enum.
 * Keep this list in sync with your Prisma `UserRole` enum:
 * enum UserRole { ADMIN STUDENT }
 */
export const userRoleSchema = z.enum(["ADMIN", "STUDENT"] as const);

export const registerUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 chars"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 chars"),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: userRoleSchema.optional(),
  password: z.string().min(6).optional(),
});

export const promoteUserRoleSchema = z.object({
  role: userRoleSchema,
});

export type RegisterUser = z.infer<typeof registerUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type PromoteUserRole = z.infer<typeof promoteUserRoleSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;

