import express, { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

/* ---------------- Create Question (Admin only) ---------------- */
router.post(
  "/topics/:topicId/questions",
  authMiddleware,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    const { topicId } = req.params;
    const { text, options } = req.body;

    try {
      const question = await prisma.question.create({
        data: {
          text,
          topicId,
          options: {
            create: options.map((opt: { text: string; isCorrect: boolean }) => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
            })),
          },
        },
        include: { options: true },
      });

      res.status(201).json(question);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating question" });
    }
  }
);

/* ---------------- Get Questions by Topic (Students/Admin) ---------------- */
router.get(
  "/topics/:topicId/questions",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { topicId } = req.params;

    try {
      const questions = await prisma.question.findMany({
        where: { topicId },
        include: {
          options: {
            select: {
              id: true,
              text: true,
              // 🚨 hide isCorrect so students can’t see
            },
          },
        },
      });

      res.json(questions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching questions" });
    }
  }
);

/* ---------------- Get Single Question ---------------- */
router.get(
  "/questions/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const question = await prisma.question.findUnique({
        where: { id },
        include: {
          options: {
            select: { id: true, text: true }, // hide isCorrect
          },
        },
      });

      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      res.json(question);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching question" });
    }
  }
);

export default router;
