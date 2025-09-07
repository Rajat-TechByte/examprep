// src/routes/user.routes.ts
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorize.js";

import { validate } from "../middleware/validate.js";
import {
  registerUserSchema,
  updateUserSchema,
  promoteUserRoleSchema,
} from "../validators/user.schema.js";

import * as userController from "../controllers/user.controller.js";

const router = express.Router();

/* ---------------- GET all users (ADMIN only) ---------------- */
router.get("/", authMiddleware, authorize("ADMIN"), userController.getAllUsers);

/* ---------------- GET user by id ---------------- */
// publicly accessible in original code — keep same behavior
router.get("/:id", userController.getUserById);

/* ---------------- CREATE user (registration) ---------------- */
router.post("/", validate(registerUserSchema, "body"), userController.createUser);

/* ---------------- UPDATE user ---------------- */
router.put("/:id", validate(updateUserSchema, "body"), userController.updateUser);

/* ---------------- DELETE user ---------------- */
router.delete("/:id", userController.deleteUser);

/* ---------------- PROMOTE user role (ADMIN only) ---------------- */
router.patch(
  "/:id/role",
  authMiddleware,
  authorize("ADMIN"),
  validate(promoteUserRoleSchema, "body"),
  userController.promoteUserRole
);

export default router;
