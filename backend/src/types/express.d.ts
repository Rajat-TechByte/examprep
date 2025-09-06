// src/types/express.d.ts
import "express-serve-static-core";
import type { UserRole } from "@prisma/client";

declare module "express-serve-static-core" {
  // typed user attached by your authMiddleware
  interface Request {
    user?: {
      id: string;
      email?: string;
      role?: UserRole | string;
    };
  }

  // existing Locals augmentation (keep as you had it)
  interface Locals {
    /**
     * validated is intentionally unknown here — controllers must cast to the
     * specific z.infer<> type they expect. This keeps type-safety while avoiding
     * complicated middleware generics (Option A approach).
     */
    validated?: unknown;
  }
}

export {};

