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

// export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "No token provided" });
//   }

//   const parts = authHeader.split(" ");
//   if (parts.length < 2) {
//     return res.status(401).json({ message: "Malformed authorization header" });
//   }

//   const token = parts[1];

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
//     // normalize to the shape we declared in src/types/express.d.ts
//     req.user = {
//       id: decoded.userId,
//       role: decoded.role,
//       email: decoded.email,
//     };
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("[authMiddleware] missing/invalid authorization header:", authHeader);
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("[authMiddleware] token preview:", String(token).slice(0,40), "...", String(token).slice(-10));
  console.log("[authMiddleware] JWT_SECRET preview:", JSON.stringify(process.env.JWT_SECRET)?.slice(0,60));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret") as AuthPayload;
    req.user = { id: decoded.userId, role: decoded.role, email: decoded.email };
    next();
  } catch (err: any) {
    console.warn("[authMiddleware] jwt.verify failed:", err && err.message ? err.message : err);
    return res.status(401).json({ message: "Invalid token" });
  }
};
