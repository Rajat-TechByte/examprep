// src/controllers/exam.controller.ts
import { Request, Response } from "express";
import { prisma } from "../prisma.js";
import type { CreateExam, UpdateExam } from "../validators/exam.schema.js";

/* ---------------- GET all exams (protected) ---------------- */
export const getAllExams = async (_req: Request, res: Response) => {
  try {
    const exams = await prisma.exam.findMany();
    res.json(exams);
  } catch (error) {
    console.error("getAllExams:", error);
    res.status(500).json({ error: "Failed to fetch exams" });
  }
};

/* ---------------- GET exam by id (public) ---------------- */
export const getExamById = async (req: Request, res: Response) => {
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

    if (!exam) return res.status(404).json({ error: "Exam not found" });

    res.json(exam);
  } catch (error) {
    console.error("getExamById:", error);
    res.status(500).json({ error: "Failed to fetch exam" });
  }
};

/* ---------------- CREATE exam (protected) ---------------- */
export const createExam = async (req: Request, res: Response) => {
  // Option A: simple cast from res.locals.validated
  const validated = res.locals.validated as CreateExam;

  try {
    const exam = await prisma.exam.create({
      data: {
        name: validated.name,
        ...(validated.syllabus !== undefined ? { syllabus: validated.syllabus } : {}),
      },
    });
    res.status(201).json(exam);
  } catch (error) {
    console.error("createExam:", error);
    res.status(500).json({ error: "Failed to create exam" });
  }
};

/* ---------------- UPDATE exam (protected) ---------------- */
export const updateExam = async (req: Request, res: Response) => {
  const { id } = req.params;
  const validated = res.locals.validated as UpdateExam;

  try {
    const exam = await prisma.exam.update({
      where: { id },
      data: {
        ...(validated.name !== undefined ? { name: validated.name } : {}),
        ...(validated.syllabus !== undefined ? { syllabus: validated.syllabus } : {}),
      },
    });
    res.status(200).json(exam);
  } catch (error: any) {
    console.error("updateExam:", error);
    // Preserve previous behavior: return 500 for other errors
    res.status(500).json({ error: "Failed to update exam" });
  }
};

/* ---------------- DELETE exam (protected) ---------------- */
export const deleteExam = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.exam.delete({ where: { id } });
    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("deleteExam:", error);
    res.status(500).json({ error: "Failed to delete exam" });
  }
};
