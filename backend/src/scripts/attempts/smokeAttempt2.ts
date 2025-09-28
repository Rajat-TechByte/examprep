// scripts/smokeAttempt.ts
/**
 * Smoke test — login -> start attempt -> submit attempt
 *
 * Usage:
 * 1. Put credentials in .env or set env vars:
 *    SEED_EMAIL, SEED_PASSWORD, START_EXAM_ID, BASE_URL
 * 2. Run:
 *    pnpm ts-node scripts/smokeAttempt.ts
 *    or
 *    node --loader ts-node/esm src/scripts/attempts/smokeAttempt2.ts
 *
 * Notes:
 * - Expects /auth/login to return { token }.
 * - Expects POST /api/attempts/start to return at least { attemptId }.
 * - Tries to locate rawSnapshot either from start response or GET /api/attempts/:id.
 * - Builds answers by choosing the first option available for each question (if present).
 */

import "dotenv/config";
import type { SubmitAttemptInput } from "../../validators/attempt.schema.js";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const LOGIN_URL = `${BASE}/auth/login`;
const START_URL = `${BASE}/api/attempts/start`;
const GET_ATTEMPT_URL = (id: string) => `${BASE}/api/attempts/${id}`;
const SUBMIT_URL = `${BASE}/api/attempts/submit`;

const EMAIL = process.env.SEED_EMAIL ?? process.env.SEED_ADMIN_EMAIL ?? "student1@example.com";
const PASSWORD = process.env.SEED_PASSWORD ?? "StudentPass123!";
const EXAM_ID = process.env.START_EXAM_ID ?? "exam-1"; // required if your start endpoint needs examId

async function pretty(obj: any) {
  console.log(JSON.stringify(obj, null, 2));
}

async function login() {
  console.log("→ Logging in as", EMAIL);
  const res = await fetch(LOGIN_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Login failed (${res.status}): ${JSON.stringify(body)}`);
  }
  const token = (body && body.token) || body.accessToken || null;
  if (!token) throw new Error("Login succeeded but no token returned");
  console.log("→ Login successful, got token (length:", token.length, ")");
  return token;
}

async function startAttempt(token: string) {
  console.log("→ Starting attempt (examId from env:", EXAM_ID, ")");
  const payload: any = {};
  if (EXAM_ID) payload.examId = EXAM_ID;
  // you can tweak requestedQuestionCount via env if you want fewer questions
  const requestedCount = process.env.REQUESTED_QUESTION_COUNT ? Number(process.env.REQUESTED_QUESTION_COUNT) : 5;
  if (requestedCount) payload.requestedQuestionCount = requestedCount;

  // Ensure quizPayload exists and matches quizSnapshotSchema:
  // quizPayload.questions must be a non-empty array; each question must have `text` and at least 2 `options`.
  // For smoke tests we provide one minimal question with two options.
  if (!payload.quizPayload) {
    payload.quizPayload = {
      questions: [
        {
          // you can include questionId/questionVersionId if you prefer, but not required
          text: "Smoke test question 1",
          options: [
            { text: "Option A" },
            { text: "Option B" }
          ],
        },
      ],
      meta: { source: "smoke-test" },
    };
  }


  const res = await fetch(START_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Start attempt failed (${res.status}): ${JSON.stringify(body)}`);
  }
  console.log("→ Start attempt response:");
  await pretty(body);

  // normalize attemptId and any returned raw snapshot
  const attemptId = body.attemptId ?? body.id ?? (body.attempt && body.attempt.id) ?? null;
  const attemptObj = body.attempt ?? body;

  return { attemptId, attemptObj };
}

async function fetchAttempt(token: string, attemptId: string) {
  console.log("→ Fetching attempt by id:", attemptId);
  const res = await fetch(GET_ATTEMPT_URL(attemptId), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.warn("→ GET attempt returned", res.status);
    return null;
  }
  const body = await res.json().catch(() => null);
  return body;
}

/**
 * Extract questions array from attempt object.
 * Tries common shapes:
 *  - attempt.rawSnapshot.questions
 *  - attempt.rawSnapshot
 *  - attempt.attempt.rawSnapshot
 */
function extractQuestionsFromAttempt(attemptObj: any): any[] | null {
  if (!attemptObj) return null;
  const attempt = attemptObj.attempt ?? attemptObj;
  const raw = attempt.rawSnapshot ?? attempt.rawSnapshotJson ?? null;
  if (!raw) return null;
  // raw might be an object with questions or directly the questions array
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.questions)) return raw.questions;
  // sometimes server returns { questions: [...] } nested inside another key
  if (raw.payload && Array.isArray(raw.payload.questions)) return raw.payload.questions;
  return null;
}

/**
 * Build answers array from questions snapshot.
 * Preference:
 *  - use questionVersionId if available
 *  - use questionId otherwise
 *  - pick first option id if available otherwise null/empty
 */
function buildAnswersFromQuestions(questions: any[]) {
  const answers: Array<any> = [];
  for (const q of questions) {
    const qObj = q || {};
    const questionVersionId = qObj.questionVersionId ?? qObj.versionId ?? null;
    const questionId = qObj.questionId ?? qObj.id ?? null;

    // options shapes: q.options or q.optionSnapshot
    const opts = Array.isArray(qObj.options) ? qObj.options : Array.isArray(qObj.optionsSnapshot) ? qObj.optionsSnapshot : [];

    let selectedOptionId: string | null = null;
    if (opts.length > 0) {
      // prefer picking a non-correct option once in a while? For smoke we pick the first
      selectedOptionId = String(opts[0].id ?? opts[0].optionId ?? opts[0].value ?? null);
      if (selectedOptionId === "null") selectedOptionId = null;
    }

    const answer: any = {
      // choose whichever id appears to be part of your grading logic
      questionVersionId: questionVersionId ?? undefined,
      questionId: questionId ?? undefined,
      selectedOptionId: selectedOptionId ?? undefined,
    };

    answers.push(answer);
  }
  return answers;
}

async function submit(token: string, attemptId: string, answers: any[]) {
  console.log("→ Submitting attempt:", attemptId, "answers:", answers.length);
  const payload: SubmitAttemptInput = {
    attemptId,
    answers,
    // optional: durationSec
    durationSec: Math.max(1, Number(process.env.DURATION_SEC ?? 60)),
  } as any;

  const res = await fetch(SUBMIT_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Submit failed (${res.status}): ${JSON.stringify(body)}`);
  }
  console.log("→ Submit response:");
  await pretty(body);
  return body;
}

(async () => {
  try {
    const token = await login();
    const { attemptId: startAttemptId, attemptObj } = await startAttempt(token);

    if (!startAttemptId) {
      throw new Error("start attempt did not return attemptId");
    }

    // try to extract snapshot from start response; otherwise fetch attempt
    let questions = extractQuestionsFromAttempt(attemptObj);
    if (!questions) {
      console.log("→ Start response did not include rawSnapshot.questions, trying GET /api/attempts/:id");
      const fetched = await fetchAttempt(token, startAttemptId);
      questions = extractQuestionsFromAttempt(fetched);
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.warn("→ Could not locate questions array in attempt snapshot. Submitting empty answers fallback.");
      // Fallback: submit zero-length answers (your server may reject this)
      const fallback = await submit(token, startAttemptId, []);
      console.log("Fallback submit result:", fallback);
      return;
    }

    console.log(`→ Found ${questions.length} questions in snapshot. Building answers...`);
    const answers = buildAnswersFromQuestions(questions);

    // trim or randomize if requested
    const maxSubmit = process.env.SUBMIT_MAX_QUESTIONS ? Number(process.env.SUBMIT_MAX_QUESTIONS) : answers.length;
    const finalAnswers = answers.slice(0, maxSubmit);

    const submitRes = await submit(token, startAttemptId, finalAnswers);
    console.log("Smoke attempt flow completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Smoke attempt failed:", (err as any)?.message ?? err);
    process.exit(2);
  }
})();
