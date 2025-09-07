// src/validators/userExam.schema.ts
import { z } from "zod";

/**
 * progress is stored as Prisma.Json. We accept a loose object map here:
 * keys are strings, values are unknown (safer than `any`).
 *
 * Use z.unknown() for values to avoid letting functions slip through.
 * Use z.any() if you want maximum permissiveness.
 */
export const registerUserExamSchema = z.object({
  userId: z.uuid(),
  examId: z.uuid(),
  // keep progress loose: object (optional). If you later define structure, tighten this.
  progress: z.record(z.string(), z.unknown()).optional(),
});

export const updateProgressSchema = z.object({
  progress: z.record(z.string(), z.unknown()),
});

export type RegisterUserExam = z.infer<typeof registerUserExamSchema>;
export type UpdateProgress = z.infer<typeof updateProgressSchema>;