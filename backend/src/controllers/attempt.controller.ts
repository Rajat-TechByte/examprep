// src/controllers/attempt.controller.ts
import { Request, Response } from "express";
import { startAttempt, submitAttempt, getAttempt } from "../services/attempt.service.js";
import type { StartAttemptInput, SubmitAttemptInput } from "../validators/attempt.schema.js";

/**
 * Map common service error messages to HTTP status codes.
 * Keeps controller logic simple — update patterns here if your service throws different messages.
 */
function mapErrorToStatus(err: unknown) {
  const msg = (err as any)?.message?.toString?.() ?? String(err ?? "");
  if (!msg) return 500;

  const lowered = msg.toLowerCase();

  // client errors
  if (lowered.includes("missing") || lowered.includes("no answers") || lowered.includes("invalid"))
    return 400; // bad request
  if (lowered.includes("not found")) return 404; // resource not found
  if (lowered.includes("already submitted") || lowered.includes("conflict")) return 409; // conflict / already done

  // fallback
  return 500;
}

/* ---------------- Start Attempt ---------------- */
export const postStartAttempt = async (req: Request, res: Response) => {
  // validated payload (res.locals.validated)
  const validated = res.locals.validated as StartAttemptInput | undefined;

  if (!validated) {
    console.warn("[postStartAttempt] missing validated payload", { path: req.path, ip: req.ip });
    return res.status(400).json({ success: false, error: "Missing validated payload" });
  }

  // 👇 Override userId with JWT payload
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

  const { examId } = validated;

  try {
    // <-- pass userId explicitly to service
    const attempt = await startAttempt({ ...validated, userId });
    console.info("[postStartAttempt] created attempt", { attemptId: attempt.id, userId, examId, ip: req.ip });
    return res.status(201).json({ success: true, attemptId: attempt.id, startedAt: attempt.startedAt });
  } catch (err) {
    const status = mapErrorToStatus(err);
    if (status >= 500) {
      console.error("[postStartAttempt] error creating attempt", { err, userId, examId, ip: req.ip });
    } else {
      console.warn("[postStartAttempt] client error", { err: (err as any)?.message, userId, examId, ip: req.ip });
    }
    return res.status(status).json({ success: false, error: (err as any)?.message ?? String(err) });
  }
};

/* ---------------- Submit Attempt ---------------- */
export const postSubmitAttempt = async (req: Request, res: Response) => {
  const validated = res.locals.validated as SubmitAttemptInput | undefined;

  if (!validated) {
    console.warn("[postSubmitAttempt] missing validated payload", { path: req.path, ip: req.ip });
    return res.status(400).json({ success: false, error: "Missing validated payload" });
  }

  // 👇 Enforce that the submit comes from the logged-in user
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

  const { attemptId } = validated;

  try {
    // <-- pass userId explicitly to service
    const result = await submitAttempt({ ...validated, userId });
    console.info("[postSubmitAttempt] attempt submitted", {
      attemptId,
      userId,
      score: result?.score,
      correctCount: result?.correctCount,
      total: result?.total,
      ip: req.ip,
    });
    return res.status(200).json({ success: true, result });
  } catch (err) {
    const status = mapErrorToStatus(err);
    if (status >= 500) {
      console.error("[postSubmitAttempt] error submitting attempt", { err, attemptId, userId, ip: req.ip });
    } else {
      console.warn("[postSubmitAttempt] client error", { err: (err as any)?.message, attemptId, userId, ip: req.ip });
    }

    // 409 (conflict) for double submissions gives a clearer UX signal
    return res.status(status).json({ success: false, error: (err as any)?.message ?? String(err) });
  }
};

/* ---------------- Get Attempt ---------------- */
export const getAttemptById = async (req: Request, res: Response) => {
  const attemptId = req.params.id;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

  try {
    const attempt = await getAttempt({ attemptId, userId });
    if (!attempt) return res.status(404).json({ success: false, error: "Attempt not found" });

    // Return the attempt object (including rawSnapshot if present)
    return res.status(200).json({ success: true, attempt });
  } catch (err) {
    console.error("[getAttemptById] error", { err, attemptId, userId, ip: req.ip });
    return res.status(500).json({ success: false, error: (err as any)?.message ?? String(err) });
  }
};
