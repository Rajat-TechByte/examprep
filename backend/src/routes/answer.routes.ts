import express, { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

/* ---------------- Submit Answer (Student) ---------------- */
router.post(
  "/questions/:id/answers",
  authMiddleware,
  authorize("STUDENT"),
  async (req: Request, res: Response) => {
    const { id: questionId } = req.params;
    const { optionId } = req.body;
    const user = (req as any).user;

    try {
      const answer = await prisma.answer.create({
        data: {
          userId: user.id,
          questionId,
          optionId,
        },
      });

      res.status(201).json(answer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error submitting answer" });
    }
  }
);

/* ---------------- Get Answers by User ---------------- */
router.get(
  "/users/:id/answers",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as any).user;

    if (user.role !== "ADMIN" && user.id !== id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const answers = await prisma.answer.findMany({
        where: { userId: id },
        include: {
          question: { select: { text: true } },
          option: { select: { text: true } },
        },
      });

      res.json(answers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching answers" });
    }
  }
);

/* ---------------- Get Answers by Exam (Admin only) ---------------- */
router.get(
  "/exams/:id/answers",
  authMiddleware,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const answers = await prisma.answer.findMany({
        where: {
          question: {
            topic: { subject: { examId: id } },
          },
        },
        include: {
          user: { select: { id: true, email: true } },
          question: { select: { text: true } },
          option: { select: { text: true, isCorrect: true } },
        },
      });

      res.json(answers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching exam answers" });
    }
  }
);

export default router;
