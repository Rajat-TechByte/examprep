// src/routes/user.routes.ts
import express, { Request, Response } from "express";
import { PrismaClient, UserRole } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Define request body type for creating/updating users
interface UserBody {
  email: string;
  name: string;
  role?: UserRole; // Role comes from Prisma enum (STUDENT, ADMIN, etc.)
}

// Define params type for routes with ":id"
interface UserParams {
  id: string;
}

// GET all users (with exams)
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        exams: {
          include: {
            exam: true,
          },
        },
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET user by id
router.get("/:id", async (req: Request<UserParams>, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        exams: {
          include: {
            exam: true,
          },
        },
      },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// CREATE user
router.post("/", async (req: Request<{}, {}, UserBody>, res: Response): Promise<void> => {
  const { email, name, role } = req.body;
  try {
    const user = await prisma.user.create({
      data: { email, name, role },
    });
    res.json(user);
  } catch (error: any) {
    // Prisma unique constraint violation
    if (error.code === "P2002") {
      res.status(400).json({ error: "Email already exists" });
      return;
    }
    res.status(500).json({ error: "Failed to create user" });
  }
});

// UPDATE user
router.put("/:id", async (req: Request<UserParams, {}, Partial<UserBody>>, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { name, role },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE user
router.delete("/:id", async (req: Request<UserParams>, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { id },
    });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
