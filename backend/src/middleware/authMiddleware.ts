// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

type AuthPayload = {
  userId: string;
  role?: UserRole | string;
  email?: string;
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const parts = authHeader.split(" ");
  if (parts.length < 2) {
    return res.status(401).json({ message: "Malformed authorization header" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    // normalize to the shape we declared in src/types/express.d.ts
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
