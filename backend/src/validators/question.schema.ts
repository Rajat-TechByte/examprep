// src/validators/question.schema.ts
import { z } from "zod";

export const optionSchema = z.object({
  text: z.string(),
  isCorrect: z.boolean(),
});

export const createQuestionSchema = z.object({
  text: z.string().min(1),
  options: z.array(optionSchema).min(2, "At least 2 options required"),
});
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
