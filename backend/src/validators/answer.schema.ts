// src/validators/answer.schema.ts
import { z } from "zod";

/**
 * Validate submitted answer payload.
 * - selectedOptionId: uuid of Option (client-provided)
 * - timeTakenMs: optional number (ms)
 *
 * Note: Prisma Answer model uses `selectedOptionId` and `questionVersionId`.
 * The controller will resolve/create the correct questionVersionId based on questionId route param.
 */
export const submitAnswerSchema = z.object({
  optionId: z.string().uuid(), // client-friendly name; controller will use it as selectedOptionId
  timeTakenMs: z.number().int().positive().optional(),
});

export type SubmitAnswer = z.infer<typeof submitAnswerSchema>;
