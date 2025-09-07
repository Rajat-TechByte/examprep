// src/routes/exam.routes.ts
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

import { createExamSchema, updateExamSchema } from "../validators/exam.schema.js";
import * as examController from "../controllers/exam.controller.js";

const router = express.Router();

/* ---------------- GET all exams (protected) ---------------- */
router.get("/", authMiddleware, authorize("STUDENT", "ADMIN"), examController.getAllExams);

/* ---------------- GET exam by id (public) ---------------- */
router.get("/:id", examController.getExamById);

/* ---------------- CREATE exam (protected) ---------------- */
router.post(
  "/",
  authMiddleware,
  authorize("ADMIN"),
  validate(createExamSchema, "body"),
  examController.createExam
);

/* ---------------- UPDATE exam (protected) ---------------- */
router.put(
  "/:id",
  authMiddleware,
  authorize("ADMIN"),
  validate(updateExamSchema, "body"),
  examController.updateExam
);
// TODO:
// what if someone wants to update but still wants the data that is present before
// the put function right now, updates to the totally new syllabus schema when we update it
// deleting the data of before

/* ---------------- DELETE exam (protected) ---------------- */
router.delete("/:id", authMiddleware, authorize("ADMIN"), examController.deleteExam);

export default router;
