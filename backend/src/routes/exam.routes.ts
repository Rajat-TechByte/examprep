// src/routes/exam.routes.ts
import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Define request body type for creating/updating exams
interface ExamBody {
  name: string;
  syllabus: string;
}

// Define params type for routes with ":id"
interface ExamParams {
  id: string;
}

// GET all exams (basic)
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const exams = await prisma.exam.findMany();
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch exams" });
  }
});

// GET exam by id (with subjects + topics + questions)
router.get("/:id", async (req: Request<ExamParams>, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const exam = await prisma.exam.findUnique({
      where: { id }, // ✅ if your schema uses string IDs
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
});

// CREATE new exam
router.post("/", async (req: Request<{}, {}, ExamBody>, res: Response): Promise<void> => {
  const { name, syllabus } = req.body;
  try {
    const exam = await prisma.exam.create({
      data: { name, syllabus },
    });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: "Failed to create exam" });
  }
});

// UPDATE exam
router.put("/:id", async (req: Request<ExamParams, {}, ExamBody>, res: Response): Promise<void> => {
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
});

// DELETE exam
router.delete("/:id", async (req: Request<ExamParams>, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.exam.delete({
      where: { id },
    });
    res.json({ message: "Exam deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete exam" });
  }
});

export default router;
