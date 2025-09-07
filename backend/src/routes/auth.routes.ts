// src/routes/auth.routes.ts
import { Router } from "express";
import { signup, login } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { signupSchema, loginSchema } from "../validators/auth.schema.js";

const router = Router();

router.post("/signup", validate(signupSchema, "body"), signup);
router.post("/login", validate(loginSchema, "body"), login);

export default router;

