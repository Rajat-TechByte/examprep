// src/routes/question.routes.ts
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createQuestionSchema } from "../validators/question.schema.js";
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

export default router;