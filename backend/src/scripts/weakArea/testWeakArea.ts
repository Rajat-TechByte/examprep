// scripts/testWeakArea.ts
import { updateWeakAreaForTopic, updateWeakAreasFromStats } from "../../services/weakArea.service.js";

/**
 * Mock txClient that stores rows in-memory.
 * Minimal methods: weakArea.findFirst, weakArea.create, weakArea.update
 */
function createMockTx() {
  const store: Record<string, any> = {};
  return {
    _store: store,
    weakArea: {
      async findFirst({ where }: any) {
        const { userId, examId, topicId } = where;
        const key = `${userId}::${examId}::${topicId}`;
        return store[key] ?? null;
      },
      async create({ data }: any) {
        const id = `wa_${Math.random().toString(36).slice(2, 9)}`;
        const created = { id, ...data };
        const key = `${data.userId}::${data.examId}::${data.topicId}`;
        store[key] = created;
        console.log("[mock create] created weak area:", created);
        return created;
      },
      async update({ where, data }: any) {
        // where = { id: existingId }
        // find by id in store
        const existingKey = Object.keys(store).find((k) => store[k].id === where.id);
        if (!existingKey) throw new Error("mock: update target not found");
        store[existingKey] = { ...store[existingKey], ...data };
        console.log("[mock update] updated weak area:", store[existingKey]);
        return store[existingKey];
      },
    },
  };
}

async function demoSingle() {
  const tx = createMockTx();
  const userId = "u1";
  const examId = "exam1";
  const topicId = "topicA";

  // first update: errorRate 0.7 (70% wrong)
  await updateWeakAreaForTopic(tx, {
    userId,
    examId,
    topicId,
    errorRate: 0.7,
    sampleMeta: { correct: 3, total: 10, avgTimeMs: 12000 },
  });

  // second update: new sample errorRate 0.4
  await updateWeakAreaForTopic(tx, {
    userId,
    examId,
    topicId,
    errorRate: 0.4,
    sampleMeta: { correct: 6, total: 10, avgTimeMs: 9000 },
  });
}

async function demoBatch() {
  const tx = createMockTx();
  const userId = "u2";
  const examId = "exam121";

  const stats = {
    topic1: { correct: 2, total: 5 },
    topic2: { correct: 5, total: 5 },
    topic3: { correct: 0, total: 3 },
  };

  const res = await updateWeakAreasFromStats(tx, userId, examId, stats);
  console.log("batch update results count:", res.length);
}

(async () => {
  console.log("→ Running weakArea service demo (mocked tx)");
  await demoSingle();
  await demoBatch();
  console.log("→ Demo complete");
})();
