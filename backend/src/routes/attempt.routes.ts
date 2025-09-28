// src/routes/attempt.routes.ts
import { Router } from "express";
import { postStartAttempt, postSubmitAttempt, getAttemptById } from "../controllers/attempt.controller.js";
import { validate } from "../middleware/validate.js";
import { startAttemptSchema, submitAttemptSchema } from "../validators/attempt.schema.js";

const router = Router();

// start attempt (client provides quizPayload produced by server / generator)
router.post("/start", validate(startAttemptSchema), postStartAttempt);

// submit attempt (grades & updates weak areas)
router.post("/submit", validate(submitAttemptSchema), postSubmitAttempt);

// get attempt by id (protected)
router.get("/:id", getAttemptById);

export default router;
