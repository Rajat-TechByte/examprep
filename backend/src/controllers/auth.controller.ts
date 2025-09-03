import { Request, Response } from "express";
import { prisma } from "../prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; // put in .env later

// Signup
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Force student roles for all signups
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: "STUDENT" },
    });

    res.status(201).json({
      message: "User created",
      user: { id: user.id, email: user.email, name: user.name, role: "STUDENT" }, // omit password
    });

  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: "Signup failed", error: err.message });
    } else {
      res.status(500).json({ message: "Signup failed", error: String(err) });
    }
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Login successful", token });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: "Login failed", error: err.message });
    } else {
      res.status(500).json({ message: "Login failed", error: String(err) });
    }
  }
};
