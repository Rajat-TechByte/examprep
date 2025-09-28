// src/services/attempt.service.ts
import { prisma } from "../prisma.js";
import type { StartAttemptInput, SubmitAttemptInput } from "../validators/attempt.schema.js";

/**
 * Start an attempt: create ExamAttempt row and store rawSnapshot (quizPayload).
 * Returns the created attempt.
 *
 * Note: controllers now inject `userId` from req.user and pass it here.
 */
export async function startAttempt(input: StartAttemptInput & { userId: string }) {
  const { userId, examId, quizPayload } = input;

  if (!userId) throw new Error("Missing userId");
  if (!examId) throw new Error("Missing examId");

  const attempt = await prisma.examAttempt.create({
    data: {
      userId,
      examId,
      rawSnapshot: quizPayload ?? null,
      startedAt: new Date(),
    },
  });

  return attempt;
}

/**
 * Submit attempt: grade using the stored rawSnapshot.
 * Transactional: writes answer rows, updates attempt, upserts weak areas.
 *
 * Note: controllers inject `userId` (authenticated user). The attempt row is the
 * source of truth for ownership; we verify the caller matches the attempt owner.
 */
export async function submitAttempt(input: SubmitAttemptInput & { userId: string }) {
  const { attemptId, answers, durationSec, userId: callerUserId } = input as SubmitAttemptInput & {
    userId: string;
  };

  if (!attemptId) throw new Error("Missing attemptId");
  if (!Array.isArray(answers) || answers.length === 0) throw new Error("No answers provided");

  // --- READ attempt (read-only) BEFORE opening a write transaction ---
  const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt) throw new Error("Attempt not found");
  if (attempt.submittedAt) throw new Error("Attempt already submitted");

  const snapshot = attempt.rawSnapshot as { questions: any[] } | null;
  if (!snapshot || !Array.isArray(snapshot.questions)) throw new Error("Invalid attempt snapshot");

  // derive userId from the saved attempt (server is source of truth)
  const userIdFromAttempt = (attempt as any).userId ?? (attempt as any).user?.id ?? null;
  if (!userIdFromAttempt) throw new Error("Attempt row missing userId — ensure startAttempt saved userId");

  // Enforce caller is the same as attempt owner
  if (String(callerUserId) !== String(userIdFromAttempt)) {
    // Keep message generic but clear for logs; controller maps to 401/403 as appropriate
    throw new Error("Unauthorized: attempt does not belong to authenticated user");
  }

  // Build lookup maps for quick matching
  const byQId = new Map<string, any>();
  const byVId = new Map<string, any>();
  snapshot.questions.forEach((q: any, idx: number) => {
    if (q.questionId) byQId.set(String(q.questionId), { ...q, __idx: idx });
    if (q.questionVersionId) byVId.set(String(q.questionVersionId), { ...q, __idx: idx });
  });

  // Build answerRows and topicStats (read-only work)
  const answerRows: Array<any> = [];
  const topicStats: Record<string, { correct: number; total: number }> = {};
  let correctCount = 0;

  for (const ans of answers) {
    let qSnapshot: any | null = null;
    if (ans.questionId && byQId.has(ans.questionId)) qSnapshot = byQId.get(ans.questionId);
    else if (ans.questionVersionId && byVId.has(ans.questionVersionId)) qSnapshot = byVId.get(ans.questionVersionId);
    else qSnapshot = null;

    let isCorrect = false;
    let matchedOptionId: string | null = null;
    let matchedOptionText: string | null = null;
    let correctOptionId: string | null = null;
    let correctOptionText: string | null = null;
    let topicId: string | null = null;
    let questionId: string | null = null;
    let questionVersionId: string | null = null;

    if (qSnapshot) {
      topicId = qSnapshot.topicId ?? null;
      questionId = qSnapshot.questionId ?? null;
      questionVersionId = qSnapshot.questionVersionId ?? null;

      const opts = Array.isArray(qSnapshot.options) ? qSnapshot.options : [];

      if (ans.selectedOptionId) {
        matchedOptionId = ans.selectedOptionId;
        const matched = opts.find((o: any) => String(o.id) === String(ans.selectedOptionId));
        if (matched) {
          matchedOptionText = matched.text;
          isCorrect = !!matched.isCorrect;
        } else {
          const textMatch = opts.find((o: any) => o.text === ans.selectedText);
          if (textMatch) {
            matchedOptionText = textMatch.text;
            isCorrect = !!textMatch.isCorrect;
            matchedOptionId = textMatch.id ?? null;
          } else {
            isCorrect = false;
          }
        }
      } else if (ans.selectedText) {
        matchedOptionText = ans.selectedText;
        const matched = opts.find((o: any) => o.text === ans.selectedText);
        if (matched) {
          isCorrect = !!matched.isCorrect;
          matchedOptionId = matched.id ?? null;
        } else {
          isCorrect = false;
        }
      } else {
        isCorrect = false;
      }

      const correctOpt = opts.find((o: any) => o.isCorrect);
      if (correctOpt) {
        correctOptionId = correctOpt.id ?? null;
        correctOptionText = correctOpt.text ?? null;
      }
    } else {
      isCorrect = false;
    }

    if (topicId) {
      if (!topicStats[topicId]) topicStats[topicId] = { correct: 0, total: 0 };
      topicStats[topicId].total += 1;
      if (isCorrect) topicStats[topicId].correct += 1;
    }

    if (isCorrect) correctCount += 1;

    answerRows.push({
      attemptId,
      userId: userIdFromAttempt,
      questionId: questionId ?? undefined,
      questionVersionId: questionVersionId ?? undefined,
      selectedOptionId: matchedOptionId ?? undefined,
      isCorrect,
      selectedSnapshot: {
        selectedText: matchedOptionText ?? ans.selectedText ?? null,
        correctOptionText,
        correctOptionId,
      },
      createdAt: new Date(),
    });
  } // end build

  const total = answers.length;
  const score = total ? (correctCount / total) * 100 : 0;

  // Helper to update weak areas inside a transaction (tx param must be a Prisma transaction client)
  const applyWeakAreas = async (txClient: any) => {
    const alpha = 0.4;
    for (const [topicId, stats] of Object.entries(topicStats)) {
      const accuracy = stats.total ? stats.correct / stats.total : 0;
      const errorRate = 1 - accuracy;

      const existing = await txClient.weakArea.findFirst({
        where: {
          userId: userIdFromAttempt,
          examId: attempt.examId,
          topicId,
        },
      });

      if (!existing) {
        await txClient.weakArea.create({
          data: {
            userId: userIdFromAttempt,
            examId: attempt.examId,
            topicId,
            weight: errorRate,
            meta: { lastSamples: stats },
          },
        });
      } else {
        const existingWeight =
          typeof existing.weight === "number" ? existing.weight : Number(existing.weight ?? 0);
        const newWeight = existingWeight * (1 - alpha) + errorRate * alpha;
        const existingMeta =
          typeof existing.meta === "object" && existing.meta !== null ? (existing.meta as Record<string, any>) : {};
        const newMeta = { ...existingMeta, lastSamples: stats };
        await txClient.weakArea.update({
          where: { id: existing.id },
          data: { weight: newWeight, meta: newMeta },
        });
      }
    }
  };

  // --- FAST PATH: try createMany inside one transaction ---
  try {
    return await prisma.$transaction(async (tx) => {
      if (answerRows.length > 0) {
        await tx.answer.createMany({
          data: answerRows.map((r) => ({
            userId: r.userId,
            attemptId: r.attemptId,
            questionId: r.questionId ?? null,
            questionVersionId: r.questionVersionId ?? null,
            selectedOptionId: r.selectedOptionId ?? null,
            isCorrect: r.isCorrect,
            selectedSnapshot: r.selectedSnapshot,
            createdAt: r.createdAt,
          })),
        });
      }

      // Protect against concurrent double-submit: only update when not submitted yet
      const updateRes = await tx.examAttempt.updateMany({
        where: { id: attemptId, submittedAt: null },
        data: { submittedAt: new Date(), durationSec: durationSec ?? null, score },
      });
      if (updateRes.count === 0) throw new Error("Attempt already submitted (concurrent)");

      const updatedAttempt = await tx.examAttempt.findUnique({ where: { id: attemptId } });

      // Weak area updates inside same tx
      await applyWeakAreas(tx);

      return { attempt: updatedAttempt, score, correctCount, total };
    });
  } catch (createManyErr) {
    // Log original error to inspect root cause (JSON/constraint/etc)
    console.error("createMany path failed, retrying per-row. original error:", createManyErr);

    // --- FALLBACK: new transaction, per-row create ---
    return await prisma.$transaction(async (tx2) => {
      for (const r of answerRows) {
        await tx2.answer.create({
          data: {
            userId: r.userId,
            attemptId: r.attemptId,
            questionVersionId: r.questionVersionId ?? undefined,
            selectedOptionId: r.selectedOptionId ?? undefined,
            isCorrect: r.isCorrect,
            selectedSnapshot: r.selectedSnapshot ?? undefined,
            createdAt: r.createdAt,
          },
        });
      }

      // again guard against concurrent submit
      const updateRes = await tx2.examAttempt.updateMany({
        where: { id: attemptId, submittedAt: null },
        data: { submittedAt: new Date(), durationSec: durationSec ?? null, score },
      });
      if (updateRes.count === 0) throw new Error("Attempt already submitted (concurrent) - fallback");

      const updatedAttempt = await tx2.examAttempt.findUnique({ where: { id: attemptId } });

      // Weak area updates in the fallback tx
      await applyWeakAreas(tx2);

      return { attempt: updatedAttempt, score, correctCount, total };
    });
  }
}


export async function getAttempt({ attemptId, userId }: { attemptId: string; userId: string }) {
  // adjust field names if your prisma model differs
  return prisma.examAttempt.findFirst({
    where: { id: attemptId, userId }, // enforce owner-only access
    select: {
      id: true,
      userId: true,
      examId: true,
      startedAt: true,
      rawSnapshot: true, // json field - returns object if stored as JSON
      // include other metadata your client needs
    },
  });
}