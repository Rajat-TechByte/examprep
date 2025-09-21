// scripts/smokeQuestion.debug.ts
import axios from "axios";

const BASE = process.env.BASE_URL ?? "http://localhost:3000"; // change to /api if needed
const ADMIN_TOKEN = process.env.ADMIN_TOKEN; // optional
const TOPIC_ID = process.env.TOPIC_ID ?? "topic-algebra-1";
const headers = ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {};

async function run() {
  try {
    console.log("BASE:", BASE);
    console.log("TOPIC_ID:", TOPIC_ID);
    console.log("HEADERS:", headers.Authorization ? "Authorization set" : "No auth header");

    const createUrl = `${BASE}/api/topics/${TOPIC_ID}/questions`;
    console.log("POST", createUrl);

    const createResp = await axios.post(
      createUrl,
      {
        text: "Smoke: debug question",
        options: [
          { text: "A", isCorrect: false },
          { text: "B", isCorrect: true },
        ],
      },
      { headers, validateStatus: () => true } // don't throw automatically on non-2xx so we can inspect
    );

    console.log("Create status:", createResp.status);
    console.log("Create headers:", createResp.headers);
    console.log("Create body:", JSON.stringify(createResp.data, null, 2));

    if (createResp.status < 200 || createResp.status >= 300) {
      throw new Error(`Create returned status ${createResp.status}`);
    }

    const qid = createResp.data?.question?.id ?? createResp.data?.id;
    console.log("Created question id:", qid);

    // continue like before only if create succeeded
  } catch (err: any) {
    console.error("=== ERROR ===");
    if (err.response) {
      console.error("HTTP status:", err.response.status);
      console.error("HTTP headers:", err.response.headers);
      // If body is HTML, print first 1000 chars to avoid noise
      const body = typeof err.response.data === "string"
        ? err.response.data.slice(0, 2000)
        : JSON.stringify(err.response.data, null, 2);
      console.error("HTTP body (truncated):", body);
    } else {
      console.error("Error message:", err.message ?? err);
    }
    console.error("Stack:", err.stack ?? "no stack");
    process.exit(1);
  }
}

run();
