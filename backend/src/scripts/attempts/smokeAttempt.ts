// scripts/smokeAttempt.ts
// Tailored smoke test for your repo structure (attempt routes mounted at /api/attempts)
// Usage (examples):
//  SMOKE_BASE_URL=http://localhost:5000 SMOKE_USER_EMAIL=dev@example.com SMOKE_USER_PW=secret node --loader ts-node/esm scripts/smokeAttempt.ts
//  SMOKE_BASE_URL=http://localhost:5000 SMOKE_AUTH_TOKEN=<jwt> node --loader ts-node/esm scripts/smokeAttempt.ts

import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.SMOKE_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
const ATTEMPT_PREFIX = "/api/attempts"; // as mounted in your server
const AUTH_PREFIX = "/auth";
const USER_ID = process.env.SMOKE_USER_ID || "user-student-1";
const EXAM_ID = process.env.SMOKE_EXAM_ID || "exam-1";

// Auth options
let AUTH_TOKEN = process.env.SMOKE_AUTH_TOKEN || "";
const EMAIL = process.env.SMOKE_USER_EMAIL;
const PWD = process.env.SMOKE_USER_PW;

function makeClient(token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return axios.create({ baseURL: BASE_URL, timeout: 10000, headers });
}

async function loginIfNeeded(client: ReturnType<typeof makeClient>) {
  if (AUTH_TOKEN) return AUTH_TOKEN;
  if (!EMAIL || !PWD) return null;

  try {
    const res = await client.post(`${AUTH_PREFIX}/login`, { email: EMAIL, password: PWD });
    const token = res?.data?.token ?? res?.data?.accessToken ?? res?.data?.data?.token;
    if (token) {
      AUTH_TOKEN = token;
      console.log("Auto-login: obtained JWT");
      return token;
    }
    console.warn("Auto-login response did not include token; response:", res.data);
    return null;
  } catch (err: any) {
    console.warn("Auto-login failed:", err?.response?.status, err?.response?.data ?? err.message);
    return null;
  }
}

async function startAttempt(client: ReturnType<typeof makeClient>, quizPayload: any) {
  const payload = { userId: USER_ID, examId: EXAM_ID, quizPayload };
  return client.post(`${ATTEMPT_PREFIX}/start`, payload);
}

async function submitAttempt(client: ReturnType<typeof makeClient>, attemptId: string, snapshot: any, durationSec = 30) {
  const answers = snapshot.questions.map((q: any, idx: number) => {
    if (idx === 0) return { questionId: q.questionId, selectedOptionId: q.options.find((o: any) => o.isCorrect).id };
    return { questionId: q.questionId, selectedOptionId: q.options.find((o: any) => !o.isCorrect).id };
  });

  const payload = { attemptId, answers, durationSec };
  return client.post(`${ATTEMPT_PREFIX}/submit`, payload);
}

async function run() {
  console.log(`Running attempt smoke test against ${BASE_URL} (attempt endpoint: ${ATTEMPT_PREFIX})`);

  // create base client (no token)
  let client = makeClient();

  // try login if credentials provided
  const token = await loginIfNeeded(client);
  if (token) client = makeClient(token);

  // Build static quiz payload that matches your DTO (snapshot)
  const quizPayload = {
    questions: [
      {
        questionId: "q-1",
        questionVersionId: "qv-1",
        topicId: "topic-1",
        text: "What is the capital of X?",
        options: [
          { id: "o1", text: "A", isCorrect: false },
          { id: "o2", text: "B", isCorrect: true }
        ],
      },
      {
        questionId: "q-2",
        questionVersionId: "qv-2",
        topicId: "topic-2",
        text: "Who discovered Y?",
        options: [
          { id: "o3", text: "C", isCorrect: true },
          { id: "o4", text: "D", isCorrect: false }
        ],
      }
    ],
    meta: { source: "smokeTest" }
  };

  // START attempt
  try {
    console.log("-> POST /api/attempts/start");
    const startRes = await startAttempt(client, quizPayload);
    console.log("start status:", startRes.status);
    console.log("start body:", JSON.stringify(startRes.data, null, 2));

    const attemptId = startRes.data?.attemptId ?? startRes.data?.attempt?.id;
    if (!attemptId) {
      console.error("No attemptId returned. Aborting. Response body:", startRes.data);
      process.exit(2);
    }

    console.log("Started attemptId =", attemptId);

    // wait a little, then submit
    await new Promise((r) => setTimeout(r, 200));

    console.log("-> POST /api/attempts/submit");
    const submitRes = await submitAttempt(client, attemptId, quizPayload, 12);
    console.log("submit status:", submitRes.status);
    console.log("submit body:", JSON.stringify(submitRes.data, null, 2));

    const result = submitRes.data?.result ?? submitRes.data;
    if (!result) {
      console.error("Submit response missing result. Body:", submitRes.data);
      process.exit(3);
    }

    const { score, correctCount, total, attempt } = result;
    console.log(`Score: ${score} (${correctCount}/${total})`);
    if (!attempt?.submittedAt) {
      console.error("Attempt row not marked as submitted in response");
      process.exit(4);
    }

    console.log("Smoke test passed ✅");
    process.exit(0);

  } catch (err: any) {
    if (err?.response) {
      console.error("Request failed -> status:", err.response.status);
      console.error("Response body:", typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("Request error:", err.message ?? err);
    }
    process.exit(1);
  }
}

run().catch(e => { console.error("Smoke script error:", e); process.exit(1); });
