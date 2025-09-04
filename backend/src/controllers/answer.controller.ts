import { Request, Response } from "express";
import { prisma } from "../prisma.js";

/* ---------------- Submit Answer ---------------- */
export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { id: questionId } = req.params;
    const { userId, optionId } = req.body; // assume userId comes from token in real setup

    const answer = await prisma.answer.create({
      data: {
        userId,
        questionId,
        optionId,
      },
      include: { option: true, question: true },
    });

    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ message: "Error submitting answer", error: err });
  }
};

/* ---------------- Get Answers for a User ---------------- */
export const getAnswersByUser = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.params;

    const answers = await prisma.answer.findMany({
      where: { userId },
      include: {
        question: { select: { text: true } },
        option: { select: { text: true, isCorrect: true } },
      },
    });

    res.json(answers);
  } catch (err) {
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
    res.status(500).json({ message: "Error fetching exam answers", error: err });
  }
};
