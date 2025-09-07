// src/validators/exam.schema.ts
import { z } from "zod";
import { syllabusSchema } from "./syllabus.schema.js";

export const createExamSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  // syllabus is optional — reuse your existing syllabus schema
  syllabus: syllabusSchema.optional(),
});

export const updateExamSchema = createExamSchema.partial();

export type CreateExam = z.infer<typeof createExamSchema>;
export type UpdateExam = z.infer<typeof updateExamSchema>;
