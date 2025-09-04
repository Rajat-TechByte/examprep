import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

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

app.use("/api/exams", examRoutes);            // /api/exams, /api/exams/:id
app.use("/api/users", userRoutes);            // /, /:id, /:id/role
app.use("/api/user-exams", userExamRoutes);   // /user-exams, /user-exams/:id
app.use("/auth", authRoutes);                 // /auth/signup, /auth/login
app.use("/api", questionRoutes);              // /topics/:topicId/questions, /questions/:id
app.use("/api", answerRoutes);                // /questions/:id/answers, /users/:id/answers, /exams/:id/answers

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
