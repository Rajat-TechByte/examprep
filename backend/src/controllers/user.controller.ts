// src/controllers/user.controller.ts
import { Request, Response } from "express";
import { prisma } from "../prisma.js";
import bcrypt from "bcrypt";

import type {
  RegisterUser,
  UpdateUser,
  PromoteUserRole,
} from "../validators/user.schema.js";

/* ---------------- Helpers ---------------- */
const sanitizeUser = (user: any) => {
  const { password, ...rest } = user;
  return rest;
};

/* ---------------- GET all users (ADMIN only) ---------------- */
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { exams: { include: { exam: true } } },
    });
    res.json(users.map(sanitizeUser));
  } catch (error) {
    console.error("getAllUsers:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

/* ---------------- GET user by id ---------------- */
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { exams: { include: { exam: true } } },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(sanitizeUser(user));
  } catch (error) {
    console.error("getUserById:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

/* ---------------- CREATE user (registration) ---------------- */
export const createUser = async (req: Request, res: Response) => {
  // Option A: simple cast
  const validated = res.locals.validated as RegisterUser;

  try {
    const hashedPassword = await bcrypt.hash(validated.password, 10);
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        password: hashedPassword,
        role: "STUDENT", // default
      },
    });
    res.status(201).json(sanitizeUser(user));
  } catch (error: any) {
    console.error("createUser:", error);
    if (error?.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
};

/* ---------------- UPDATE user ---------------- */
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const validated = res.locals.validated as UpdateUser;

  try {
    const updateData: any = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.role !== undefined) updateData.role = validated.role;
    if (validated.password) {
      updateData.password = await bcrypt.hash(validated.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    res.json(sanitizeUser(user));
  } catch (error: any) {
    console.error("updateUser:", error);
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Failed to update user" });
  }
};

/* ---------------- DELETE user ---------------- */
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("deleteUser:", error);
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Failed to delete user" });
  }
};

/* ---------------- PROMOTE user role (ADMIN only) ---------------- */
export const promoteUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const validated = res.locals.validated as PromoteUserRole;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role: validated.role },
    });
    res.json({ message: "Role updated", user: sanitizeUser(user) });
  } catch (error: any) {
    console.error("promoteUserRole:", error);
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Failed to update role" });
  }
};
