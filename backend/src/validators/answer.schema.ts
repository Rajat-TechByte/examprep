// src/validators/answer.schema.ts
import { z } from "zod";

/**
 * We validate only the optionId here. userId will come from authenticated req.user.
 * Using strict UUID validation (z.uuid()) to match Prisma's UUID ids.
 */
export const submitAnswerSchema = z.object({
  optionId: z.uuid(),
});

export type SubmitAnswer = z.infer<typeof submitAnswerSchema>;
