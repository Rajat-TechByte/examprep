// src/routes/userExam.routes.ts
import express from "express";
import { validate } from "../middleware/validate.js";
import {
  registerUserExamSchema,
  updateProgressSchema,
} from "../validators/userExam.schema.js";
import * as userExamController from "../controllers/userExam.controller.js";

const router = express.Router();

// GET all user-exam records
router.get("/", userExamController.getAllUserExams);

// GET specific user-exam record
router.get("/:id", userExamController.getUserExamById);

// REGISTER a user for an exam
router.post("/", validate(registerUserExamSchema, "body"), userExamController.registerUserExam);

// UPDATE progress
router.put("/:id", validate(updateProgressSchema, "body"), userExamController.updateUserExamProgress);

// DELETE user-exam record (unregister user)
router.delete("/:id", userExamController.deleteUserExam);

export default router;
