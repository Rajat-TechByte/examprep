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

app.use("/api/exams", examRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user-exams", userExamRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
