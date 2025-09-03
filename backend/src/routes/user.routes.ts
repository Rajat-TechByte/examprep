// src/routes/user.routes.ts
import express, { RequestHandler } from "express";
import { prisma } from "../prisma.js";
import { UserRole } from "@prisma/client";
import { ParamsDictionary } from "express-serve-static-core";
import bcrypt from "bcrypt";

const router = express.Router();

/* ---------------- Types ---------------- */
interface UserBody {
  email: string;
  name: string;
  role?: UserRole;
  password: string; 
}

interface UserParams extends ParamsDictionary {
  id: string;
}

/* ---------------- Helpers ---------------- */
// Exclude password before sending user in response
const sanitizeUser = (user: any) => {
  const { password, ...rest } = user;
  return rest;
};

/* ---------------- GET all users (with exams) ---------------- */
const getAllUsers: RequestHandler = async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        exams: { include: { exam: true } },
      },
    });

    res.json(users.map(sanitizeUser));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
router.get("/", getAllUsers);

/* ---------------- GET user by id ---------------- */
const getUserById: RequestHandler<UserParams> = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        exams: { include: { exam: true } },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};
router.get("/:id", getUserById);

/* ---------------- CREATE user ---------------- */
const createUser: RequestHandler<{}, any, UserBody> = async (req, res) => {
  const { email, name, role, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, name, role, password: hashedPassword },
    });

    res.json(sanitizeUser(user));
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(400).json({ error: "Email already exists" });
      return;
    }
    res.status(500).json({ error: "Failed to create user" });
  }
};
router.post("/", createUser);

/* ---------------- UPDATE user ---------------- */
const updateUser: RequestHandler<UserParams, any, Partial<UserBody>> = async (
  req,
  res
) => {
  const { id } = req.params;
  const { name, role, password } = req.body;

  try {
    const updateData: any = { name, role };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};
router.put("/:id", updateUser);

/* ---------------- DELETE user ---------------- */
const deleteUser: RequestHandler<UserParams> = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};
router.delete("/:id", deleteUser);

export default router;
