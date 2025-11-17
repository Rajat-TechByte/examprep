// src/services/weakArea.service.ts
import type { PrismaClient, Prisma } from "@prisma/client";

/**
 * WeakArea service
 *
 * Responsibilities:
 * - Provide an atomic way to update per-user/exam/topic weak area weights using EMA.
 * - Maintain a small `meta` shape: { attemptCount, consecutiveWrong, avgTimeMs, lastSamples }
 *
 * Notes:
 * - Alpha (EMA smoothing) is fixed at 0.4 (per project decision).
 * - Exposes two helpers:
 *    - updateWeakAreaForTopic(txClient, params) -> used inside transactions
 *    - updateWeakAreasFromStats(prismaOrTx, userId, examId, topicStats, opts?)
 */

export type TopicStat = { correct: number; total: number };

const DEFAULT_ALPHA = 0.4;

export interface UpdateWeakAreaOpts {
  alpha?: number;
  now?: Date;
}

/**
 * Update or create a single WeakArea row for one topic (inside a transaction client).
 *
 * txClient must expose prisma-like methods:
 *  - weakArea.findFirst({...})
 *  - weakArea.create({...})
 *  - weakArea.update({...})
 *
 * Using findFirst + create/update keeps this simple and compatible with Prisma tx clients.
 */
export async function updateWeakAreaForTopic(
  txClient: PrismaClient | any,
  params: {
    userId: string;
    examId: string;
    topicId: string;
    errorRate: number; // between 0..1
    sampleMeta?: { correct: number; total: number; avgTimeMs?: number };
  },
  opts: UpdateWeakAreaOpts = {}
) {
  const { userId, examId, topicId, errorRate, sampleMeta } = params;
  const alpha = typeof opts.alpha === "number" ? opts.alpha : DEFAULT_ALPHA;
  const now = opts.now ?? new Date();

  // Defensive clamps
  const clampedError = Math.max(0, Math.min(1, Number(errorRate ?? 0)));

  // find existing weak area
  const existing = await txClient.weakArea.findFirst({
    where: { userId, examId, topicId },
  });

  if (!existing) {
    const meta = {
      attemptCount: 1,
      consecutiveWrong: (sampleMeta && sampleMeta.correct < (sampleMeta.total ?? 1) ? 1 : 0),
      avgTimeMs: sampleMeta?.avgTimeMs ?? null,
      lastSamples: { correct: sampleMeta?.correct ?? 0, total: sampleMeta?.total ?? 0 },
    };

    return txClient.weakArea.create({
      data: {
        userId,
        examId,
        topicId,
        weight: clampedError,
        meta,
        createdAt: now,
      },
    });
  } else {
    const existingWeight = Number(existing.weight ?? 0);
    const newWeight = existingWeight * (1 - alpha) + clampedError * alpha;

    const existingMeta: any = (existing.meta && typeof existing.meta === "object") ? existing.meta : {};
    const prevAttemptCount = typeof existingMeta.attemptCount === "number" ? existingMeta.attemptCount : 0;
    const prevConsec = typeof existingMeta.consecutiveWrong === "number" ? existingMeta.consecutiveWrong : 0;
    const prevAvgTime = typeof existingMeta.avgTimeMs === "number" ? existingMeta.avgTimeMs : null;

    const sampleCount = sampleMeta?.total ?? 0;
    const sampleCorrect = sampleMeta?.correct ?? 0;
    const isWrongSample = sampleCount > 0 && sampleCorrect < sampleCount ? 1 : 0;

    // incremental avgTime update (if sampleMeta.avgTimeMs provided)
    let newAvgTime = prevAvgTime;
    if (typeof sampleMeta?.avgTimeMs === "number") {
      if (prevAvgTime === null) newAvgTime = sampleMeta.avgTimeMs;
      else {
        // weighted average by counts (simple running average)
        newAvgTime = (prevAvgTime * prevAttemptCount + sampleMeta.avgTimeMs) / (prevAttemptCount + 1);
      }
    }

    const newMeta = {
      ...existingMeta,
      attemptCount: prevAttemptCount + 1,
      consecutiveWrong: isWrongSample ? prevConsec + 1 : 0,
      avgTimeMs: newAvgTime,
      lastSamples: { correct: sampleCorrect, total: sampleCount },
    };

    return txClient.weakArea.update({
      where: { id: existing.id },
      data: {
        weight: newWeight,
        meta: newMeta,
        lastUpdated: now,
      },
    });
  }
}

/**
 * Convenience: update multiple weak areas from a topicStats map.
 *
 * topicStats: Record<string, { correct: number, total: number, avgTimeMs?: number }>
 *
 * This helper can accept either:
 *  - A Prisma transaction client (inside prisma.$transaction) OR
 *  - The top-level prisma client (it will still run sequentially).
 *
 * Returns an array of results from the underlying create/update calls.
 */
export async function updateWeakAreasFromStats(
  prismaOrTx: PrismaClient | any,
  userId: string,
  examId: string,
  topicStats: Record<string, TopicStat>,
  opts: UpdateWeakAreaOpts = {}
) {
  const results: any[] = [];

  // If caller passed a full prisma client (not a tx client), we still perform sequential ops.
  for (const [topicId, stat] of Object.entries(topicStats)) {
    const accuracy = stat.total ? stat.correct / stat.total : 0;
    const errorRate = 1 - accuracy;

    const res = await updateWeakAreaForTopic(
      prismaOrTx,
      {
        userId,
        examId,
        topicId,
        errorRate,
        sampleMeta: { correct: stat.correct, total: stat.total },
      },
      opts
    );
    results.push(res);
  }

  return results;
}
