// src/scripts/test-schemas.ts
import { createExamSchema } from "../validators/exam.schema.js";
import { submitAnswerSchema } from "../validators/answer.schema.js";

const goodExam = {
  name: "Sample Exam",
  syllabus: { subjects: [{ name: "Math", topics: ["Algebra"] }] },
};

const badExam = { name: "" };

console.log("GOOD exam:", createExamSchema.safeParse(goodExam)); // success: true
console.log("BAD exam:", createExamSchema.safeParse(badExam));  // success: false

const goodAnswer = { optionId: "550e8400-e29b-41d4-a716-446655440000" };
const badAnswer = { optionId: "not-a-uuid" };

console.log("GOOD answer:", submitAnswerSchema.safeParse(goodAnswer)); // success: true
console.log("BAD answer:", submitAnswerSchema.safeParse(badAnswer));   // success: false
