// src/controllers/answer.controller.ts
import { Request, Response } from "express";
import { prisma } from "../prisma.js";
import type { SubmitAnswer } from "../validators/answer.schema.js";
import { Prisma } from "@prisma/client";

/* ---------------- Submit Answer ---------------- */
export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { id: questionId } = req.params; // questionId from route
    const validated = res.locals.validated as SubmitAnswer;
    const { optionId, timeTakenMs } = validated;

    // user comes from authMiddleware
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // 1) Try to find the latest QuestionVersion for this question
    let qVersion = await prisma.questionVersion.findFirst({
      where: { questionId },
      orderBy: { versionNumber: "desc" },
    });

    // 2) If not found, create a snapshot (QuestionVersion) from the current Question + options
    if (!qVersion) {
      // fetch question + options
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { options: true },
      });

      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      // Build options snapshot array: keep id,text,isCorrect (isCorrect may be omitted)
      const optionsSnapshot = question.options.map((o) => ({
        id: o.id,
        text: o.text,
        isCorrect: o.isCorrect ?? false,
      }));

      // Determine next versionNumber for the question
      const latest = await prisma.questionVersion.findFirst({
        where: { questionId },
        orderBy: { versionNumber: "desc" },
        select: { versionNumber: true },
      });
      const nextVersionNumber = latest ? latest.versionNumber + 1 : 1;

      qVersion = await prisma.questionVersion.create({
        data: {
          questionId,
          versionNumber: nextVersionNumber,
          text: question.text,
          // <-- Cast to Prisma.InputJsonValue because TS can't infer it automatically.
          // We created this array from DB rows; it's JSON-compatible.
          options: optionsSnapshot as unknown as Prisma.InputJsonValue,
        },
      });
    }

    // 3) Decide correctness by checking option in snapshot (if present)
    let isCorrect: boolean | null = null;
    try {
      // qVersion.options is usually already a parsed JS value (Prisma returns JSON as JS objects),
      // but we coerce it to `any[]` safely:
      const opts = Array.isArray(qVersion.options) ? (qVersion.options as any[]) : [];
      const matched = opts.find((o: any) => o.id === optionId);
      if (matched) isCorrect = !!matched.isCorrect;
    } catch {
      // ignore parse errors; leave isCorrect null
      isCorrect = null;
    }

    // 4) Create the Answer using selectedOptionId and questionVersionId
    const answer = await prisma.answer.create({
      data: {
        userId: user.id,
        questionVersionId: qVersion.id,
        selectedOptionId: optionId,
        isCorrect: isCorrect ?? undefined,
        timeTakenMs: timeTakenMs ?? undefined,
      },
      include: {
        questionVersion: true,
        user: { select: { id: true, email: true } },
      },
    });

    res.status(201).json(answer);
  } catch (err) {
    console.error("submitAnswer:", err);
    res.status(500).json({ message: "Error submitting answer", error: (err as any)?.message ?? String(err) });
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
        // Answer references questionVersion snapshot and user
        questionVersion: { select: { id: true, text: true, versionNumber: true } },
        user: { select: { id: true, email: true } },
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

    // We need to join from Answer -> QuestionVersion -> Question -> Topic -> Subject -> Exam
    const answers = await prisma.answer.findMany({
      where: {
        questionVersion: {
          question: {
            topic: {
              subject: {
                examId,
              },
            },
          },
        },
      },
      include: {
        user: { select: { id: true, email: true } },
        questionVersion: { select: { id: true, text: true, versionNumber: true } },
      },
    });

    res.json(answers);
  } catch (err) {
    console.error("getAnswersByExam:", err);
    res.status(500).json({ message: "Error fetching exam answers", error: err });
  }
};
