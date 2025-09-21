// src/controllers/question.controller.ts
import { Request, Response } from "express";
import { prisma } from "../prisma.js";
import type { CreateQuestionInput } from "../validators/question.schema.js";
import type { UpdateQuestionInput } from "../validators/question.schema.js";
import { createQuestionWithVersion, updateQuestionWithVersion } from "../services/question.service.js";

/* ---------------- Create Question (Admin only) ---------------- */
export const createQuestion = async (req: Request, res: Response) => {
  const { topicId } = req.params;
  const validated = res.locals.validated as CreateQuestionInput;
  const { text, options } = validated;

  try {
    const { question, version } = await createQuestionWithVersion(topicId, { text, options });
    res.status(201).json({ question, questionVersionId: version.id });
  } catch (error) {
    console.error("createQuestion:", error);
    res.status(500).json({ message: "Error creating question", error: (error as any)?.message ?? error });
  }
};

/* ---------------- Update Question (Admin only) ---------------- */
export const updateQuestion = async (req: Request, res: Response) => {
  const { id } = req.params; // question id
  const validated = res.locals.validated as UpdateQuestionInput;

  try {
    const { question, version } = await updateQuestionWithVersion(id, validated);
    return res.status(200).json({ question, questionVersionId: version.id });
  } catch (err) {
    console.error("updateQuestion:", err);
    return res.status(500).json({ message: "Error updating question", error: (err as any)?.message ?? err });
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
          select: { id: true, text: true }, // hide isCorrect for students
        },
      },
    });

    res.json(questions);
  } catch (err) {
    console.error("getQuestionsByTopic:", err);
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
    console.error("getQuestionById:", err);
    res.status(500).json({ message: "Error fetching question", error: err });
  }
};

/* ---------------- List versions for a question ---------------- */
export const getQuestionVersions = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;

    const versions = await prisma.questionVersion.findMany({
      where: { questionId },
      orderBy: { versionNumber: "desc" },
    });

    res.json(versions);
  } catch (err) {
    console.error("getQuestionVersions:", err);
    res.status(500).json({ message: "Error fetching question versions", error: err });
  }
};

/* ---------------- Get specific version (by versionNumber) ---------------- */
export const getQuestionVersion = async (req: Request, res: Response) => {
  try {
    const { questionId, versionNumber } = req.params;

    const version = await prisma.questionVersion.findFirst({
      where: { questionId, versionNumber: Number(versionNumber) },
    });

    if (!version) return res.status(404).json({ message: "Question version not found" });

    res.json(version);
  } catch (err) {
    console.error("getQuestionVersion:", err);
    res.status(500).json({ message: "Error fetching question version", error: err });
  }
};
