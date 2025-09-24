// src/validators/attempt.schema.ts
import { z } from "zod";

/**
 * Shape of a single question snapshot inside the quiz payload.
 * Keep fields minimal: questionId (optional), questionVersionId (optional),
 * topicId (optional), text, options: [{ id?, text, isCorrect? }]
 */
export const snapshotOptionSchema = z.object({
  id: z.string().optional(),
  text: z.string(),
  isCorrect: z.boolean().optional(),
});

export const snapshotQuestionSchema = z.object({
  questionId: z.string().optional(),
  questionVersionId: z.string().optional(),
  topicId: z.string().optional(),
  text: z.string(),
  options: z.array(snapshotOptionSchema).min(2),
});

export const quizSnapshotSchema = z.object({
  questions: z.array(snapshotQuestionSchema).min(1),
  meta: z.any().optional(),
});

export const startAttemptSchema = z.object({
  userId: z.string(),
  examId: z.string(),
  quizPayload: quizSnapshotSchema,
});
export type StartAttemptInput = z.infer<typeof startAttemptSchema>;

/**
 * Submit payload: array of answers referencing snapshot's question items.
 * Each answer can reference questionId or questionVersionId, and either a selectedOptionId (if option ids were used)
 * or selectedText (for direct text matching).
 */
export const submitAnswerSchema = z.object({
  questionId: z.string().optional(),
  questionVersionId: z.string().optional(),
  selectedOptionId: z.string().optional(),
  selectedText: z.string().optional(),
});

export const submitAttemptSchema = z.object({
  attemptId: z.string(),
  answers: z.array(submitAnswerSchema).min(1),
  durationSec: z.number().optional(),
});
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
