// src/validators/question.schema.ts
import { z } from "zod";

export const optionSchema = z.object({
  text: z.string(),
  // Make isCorrect optional: admins may omit and DB can default it.
  isCorrect: z.boolean().optional(),
});

// for update we accept optional id if frontend supplies stable option ids
export const optionUpdateSchema = optionSchema.extend({
  id: z.string().optional()
});

export const createQuestionSchema = z.object({
  text: z.string().min(1),
  options: z.array(optionSchema).min(2, "At least 2 options required"),
});
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

// Update schema: both text and options are optional, but if options provided they must be >=2
export const updateQuestionSchema = z.object({
  text: z.string().min(1).optional(),
  options: z.array(optionUpdateSchema).min(2).optional(),
});
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;