// src/routes/question.routes.ts
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  createQuestionSchema,
  updateQuestionSchema,
} from "../validators/question.schema.js";
import * as questionController from "../controllers/question.controller.js";

const router = express.Router();

/* ---------------- Create Question (Admin only) ---------------- */
router.post(
  "/topics/:topicId/questions",
  authMiddleware,
  authorize("ADMIN"),
  validate(createQuestionSchema, "body"),
  questionController.createQuestion
);

/* ---------------- Update Question (Admin only) ---------------- */
router.put(
  "/questions/:id",
  authMiddleware,
  authorize("ADMIN"),
  validate(updateQuestionSchema, "body"),
  questionController.updateQuestion
);

/* ---------------- Get Questions by Topic (Students/Admin) ---------------- */
router.get(
  "/topics/:topicId/questions",
  authMiddleware,
  questionController.getQuestionsByTopic
);

/* ---------------- Get Single Question ---------------- */
router.get(
  "/questions/:id",
  authMiddleware,
  questionController.getQuestionById
);

/* ---------------- List versions for a question (Admin only) ---------------- */
router.get(
  "/questions/:questionId/versions",
  authMiddleware,
  authorize("ADMIN"),
  questionController.getQuestionVersions
);

/* ---------------- Get specific version (Admin only) ---------------- */
router.get(
  "/questions/:questionId/versions/:versionNumber",
  authMiddleware,
  authorize("ADMIN"),
  questionController.getQuestionVersion
);

export default router;
