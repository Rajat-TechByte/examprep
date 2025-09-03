// src/routes/exam.routes.ts
import express, { RequestHandler } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { ParamsDictionary } from "express-serve-static-core";

import { authorize } from "../middleware/authorize.js";

const router = express.Router();

// Define request body type for creating/updating exams
interface ExamBody {
  name: string;
  syllabus: string;
}

// Define params type for routes with ":id"
interface ExamParams extends ParamsDictionary {
  id: string;
}

/* ---------------- GET all exams (protected) ---------------- */
const getAllExams: RequestHandler = async (_req, res) => {
  try {
    const exams = await prisma.exam.findMany();
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch exams" });
  }
};
router.get("/", authMiddleware, authorize("STUDENT", "ADMIN"), getAllExams);

/* ---------------- GET exam by id (public) ---------------- */
const getExamById: RequestHandler<ExamParams> = async (req, res) => {
  const { id } = req.params;
  try {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            topics: {
              include: {
                questions: true,
              },
            },
          },
        },
      },
    });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch exam" });
  }
};
router.get("/:id", getExamById);

/* ---------------- CREATE exam (protected) ---------------- */
const createExam: RequestHandler<{}, any, ExamBody> = async (req, res) => {
  const { name, syllabus } = req.body;
  try {
    const exam = await prisma.exam.create({
      data: { name, syllabus },
    });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: "Failed to create exam" });
  }
};
router.post("/", authMiddleware, authorize("ADMIN"), createExam);

/* ---------------- UPDATE exam (protected) ---------------- */
const updateExam: RequestHandler<ExamParams, any, ExamBody> = async (req, res) => {
  const { id } = req.params;
  const { name, syllabus } = req.body;
  try {
    const exam = await prisma.exam.update({
      where: { id },
      data: { name, syllabus },
    });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: "Failed to update exam" });
  }
};
router.put("/:id", authMiddleware,authorize("ADMIN"), updateExam);

/* ---------------- DELETE exam (protected) ---------------- */
const deleteExam: RequestHandler<ExamParams> = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.exam.delete({ where: { id } });
    res.json({ message: "Exam deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete exam" });
  }
};
router.delete("/:id", authMiddleware, authorize("ADMIN"), deleteExam);

export default router;
