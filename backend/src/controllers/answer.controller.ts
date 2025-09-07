// src/controllers/answer.controller.ts
import { Request, Response } from "express";
import { prisma } from "../prisma.js";
import type { SubmitAnswer } from "../validators/answer.schema.js";

/* ---------------- Submit Answer ---------------- */
export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { id: questionId } = req.params;
    // optionId validated in middleware
    const validated = res.locals.validated as SubmitAnswer;
    const { optionId } = validated;

    // user comes from authMiddleware
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const answer = await prisma.answer.create({
      data: {
        userId: user.id,
        questionId,
        optionId,
      },
      include: { option: true, question: true },
    });

    res.status(201).json(answer);
  } catch (err) {
    console.error("submitAnswer:", err);
    res.status(500).json({ message: "Error submitting answer", error: err });
  }
};

/* ---------------- Get Answers for a User ---------------- */
export const getAnswersByUser = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.params;

    const user = (req as any).user;
    if (user.role !== "ADMIN" && user.id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const answers = await prisma.answer.findMany({
      where: { userId },
      include: {
        question: { select: { text: true } },
        option: { select: { text: true, isCorrect: true } },
      },
    });

    res.json(answers);
  } catch (err) {
    console.error("getAnswersByUser:", err);
    res.status(500).json({ message: "Error fetching answers", error: err });
  }
};

/* ---------------- Get Answers for an Exam ---------------- */
export const getAnswersByExam = async (req: Request, res: Response) => {
  try {
    const { id: examId } = req.params;

    const answers = await prisma.answer.findMany({
      where: {
        question: {
          topic: {
            subject: {
              examId,
            },
          },
        },
      },
      include: {
        user: { select: { id: true, email: true } },
        question: { select: { text: true } },
        option: { select: { text: true, isCorrect: true } },
      },
    });

    res.json(answers);
  } catch (err) {
    console.error("getAnswersByExam:", err);
    res.status(500).json({ message: "Error fetching exam answers", error: err });
  }
};
