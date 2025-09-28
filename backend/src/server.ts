import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authMiddleware } from "./middleware/authMiddleware.js";

console.log("BOOT: JWT_SECRET =", JSON.stringify(process.env.JWT_SECRET));


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (_req: Request, res: Response) => {
  res.send("Backend running 🚀");
});

// Import routes (later we'll add auth, exams, quiz, etc.)
import examRoutes from "./routes/exam.routes.js";
import userRoutes from "./routes/user.routes.js";
import userExamRoutes from "./routes/userExam.routes.js";
import authRoutes from "./routes/auth.routes.js";
import questionRoutes from "./routes/question.routes.js";
import answerRoutes from "./routes/answer.routes.js";
import attemptRoutes from "./routes/attempt.routes.js";

app.use("/api/exams", examRoutes);            // /api/exams, /api/exams/:id
app.use("/api/users", userRoutes);            // /, /:id, /:id/role
app.use("/api/user-exams", userExamRoutes);   // /user-exams, /user-exams/:id
app.use("/auth", authRoutes);                 // /auth/signup, /auth/login
app.use("/api", questionRoutes);              // /topics/:topicId/questions, /questions/:id
app.use("/api", answerRoutes);                // /questions/:id/answers, /users/:id/answers, /exams/:id/answers

app.use("/api/attempts", authMiddleware, attemptRoutes);      // /start, /submit


app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// TODO: Centralized error handling
// - Add a global errorHandler middleware (src/middleware/errorHandler.ts)
// - Wrap async routes with asyncHandler to avoid try/catch repetition
// - Map Prisma errors (P2002 unique constraint, P2025 not found, etc.) to user-friendly messages
// - Use ApiError class or http-errors package for consistent error shapes
// - This will make the backend look production-ready

