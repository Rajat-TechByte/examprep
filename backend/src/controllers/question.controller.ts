import { Request, Response } from "express";
import { prisma } from "../prisma.js";

/* ---------------- Create Question (Admin only) ---------------- */
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const { text, options } = req.body;
    // options = [{ text: "A", isCorrect: false }, ...]

    const question = await prisma.question.create({
      data: {
        text,
        topicId,
        options: {
          create: options,
        },
      },
      include: { options: true },
    });

    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: "Error creating question", error: err });
  }
};

/* ---------------- Get All Questions for a Topic ---------------- */
export const getQuestionsByTopic = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;

    const questions = await prisma.question.findMany({
      where: { topicId },
      include: {
        options: {
          select: { id: true, text: true }, // hide isCorrect
        },
      },
    });

    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching questions", error: err });
  }
};

/* ---------------- Get Single Question ---------------- */
export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        options: {
          select: { id: true, text: true }, // hide isCorrect
        },
      },
    });

    if (!question) return res.status(404).json({ message: "Question not found" });

    res.json(question);
  } catch (err) {
    res.status(500).json({ message: "Error fetching question", error: err });
  }
};
