// src/routes/userExam.routes.ts
import express, { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// --- Interfaces for typing ---
interface UserExamBody {
  userId: string;
  examId: string;
  progress?: Prisma.InputJsonValue; // progress can be any JSON object
}

interface ProgressBody {
  progress: Prisma.InputJsonValue;
}

interface UserExamParams {
  id: string;
}

// --- Routes ---

// GET all user-exam records
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const records = await prisma.userExam.findMany({
      include: {
        user: true,
        exam: true,
      },
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user exams" });
  }
});

// GET specific user-exam record
router.get("/:id", async (req: Request<UserExamParams>, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const record = await prisma.userExam.findUnique({
      where: { id },
      include: { user: true, exam: true },
    });
    if (!record) {
      res.status(404).json({ error: "Record not found" });
      return;
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch record" });
  }
});

// REGISTER a user for an exam
router.post("/", async (req: Request<{}, {}, UserExamBody>, res: Response): Promise<void> => {
  const { userId, examId, progress } = req.body;
  try {
    const record = await prisma.userExam.create({
      data: {
        userId,
        examId,
        progress: progress || {}, // default empty object if not provided
      },
      include: { user: true, exam: true },
    });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: "Failed to register user for exam" });
  }
});

// UPDATE progress
router.put("/:id", async (req: Request<UserExamParams, {}, ProgressBody>, res: Response): Promise<void> => {
  const { id } = req.params;
  const { progress } = req.body;
  try {
    const updated = await prisma.userExam.update({
      where: { id },
      data: { progress },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// DELETE user-exam record (unregister user)
router.delete("/:id", async (req: Request<UserExamParams>, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.userExam.delete({
      where: { id },
    });
    res.json({ message: "User removed from exam successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete record" });
  }
});

export default router;
