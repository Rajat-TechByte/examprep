// src/controllers/userExam.controller.ts
import { Request, Response } from "express";
import { prisma } from "../prisma.js";
import type { RegisterUserExam, UpdateProgress } from "../validators/userExam.schema.js";
import type { Prisma } from "@prisma/client";

/* ---------------- GET all user-exam records ---------------- */
export const getAllUserExams = async (_req: Request, res: Response) => {
  try {
    const records = await prisma.userExam.findMany({
      include: {
        user: true,
        exam: true,
      },
    });
    res.json(records);
  } catch (error) {
    console.error("getAllUserExams:", error);
    res.status(500).json({ error: "Failed to fetch user exams" });
  }
};

/* ---------------- GET specific user-exam record ---------------- */
export const getUserExamById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const record = await prisma.userExam.findUnique({
      where: { id },
      include: { user: true, exam: true },
    });
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  } catch (error) {
    console.error("getUserExamById:", error);
    res.status(500).json({ error: "Failed to fetch record" });
  }
};

/* ---------------- REGISTER a user for an exam ---------------- */
export const registerUserExam = async (req: Request, res: Response) => {
  const validated = res.locals.validated as RegisterUserExam;
  const { userId, examId, progress } = validated as {
    userId: string;
    examId: string;
    progress?: Prisma.InputJsonValue;
  };

  try {
    const record = await prisma.userExam.create({
      data: {
        userId,
        examId,
        progress: progress || {},
      },
      include: { user: true, exam: true },
    });
    res.status(201).json(record);
  } catch (error) {
    console.error("registerUserExam:", error);
    res.status(500).json({ error: "Failed to register user for exam" });
  }
};

/* ---------------- UPDATE progress ---------------- */
export const updateUserExamProgress = async (req: Request, res: Response) => {
  const { id } = req.params;
  const validated = res.locals.validated as UpdateProgress;
  const { progress } = validated as { progress: Prisma.InputJsonValue };

  try {
    const updated = await prisma.userExam.update({
      where: { id },
      data: { progress },
    });
    res.json(updated);
  } catch (error) {
    console.error("updateUserExamProgress:", error);
    res.status(500).json({ error: "Failed to update progress" });
  }
};

/* ---------------- DELETE user-exam record (unregister user) ---------------- */
export const deleteUserExam = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.userExam.delete({ where: { id } });
    res.json({ message: "User removed from exam successfully" });
  } catch (error) {
    console.error("deleteUserExam:", error);
    res.status(500).json({ error: "Failed to delete record" });
  }
};
