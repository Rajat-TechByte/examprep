// src/routes/answer.routes.ts
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { submitAnswerSchema } from "../validators/answer.schema.js";
import * as answerController from "../controllers/answer.controller.js";

const router = express.Router();

/* ---------------- Submit Answer (Student) ---------------- */
router.post(
  "/questions/:id/answers",
  authMiddleware,
  authorize("STUDENT"),
  validate(submitAnswerSchema, "body"),
  answerController.submitAnswer
);

/* ---------------- Get Answers by User ---------------- */
router.get(
  "/users/:id/answers",
  authMiddleware,
  answerController.getAnswersByUser
);

/* ---------------- Get Answers by Exam (Admin only) ---------------- */
router.get(
  "/exams/:id/answers",
  authMiddleware,
  authorize("ADMIN"),
  answerController.getAnswersByExam
);

export default router;
