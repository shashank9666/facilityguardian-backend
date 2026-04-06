import { Router } from "express";
import { body, param, query } from "express-validator";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import * as ctrl from "../controllers/spaces";

const router = Router();

router.get(
  "/",
  authenticate,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 500 }),
    query("status").optional().isIn(["available", "occupied", "maintenance", "reserved"]),
    query("floor").optional().isString().trim(),
    query("building").optional().isString().trim(),
    validate,
  ],
  ctrl.getSpaces,
);

router.get("/:id", authenticate, [param("id").isMongoId(), validate], ctrl.getSpace);

router.post(
  "/",
  authenticate,
  requireRole("manager"),
  [
    body("name").notEmpty().trim().escape(),
    body("floor").notEmpty().trim().escape(),
    body("building").notEmpty().trim().escape(),
    body("type").notEmpty().trim(),
    body("capacity").isInt({ min: 0 }),
    validate,
  ],
  ctrl.createSpace,
);

router.patch(
  "/:id",
  authenticate,
  requireRole("technician"),
  [
    param("id").isMongoId(),
    body("status").optional().isIn(["available", "occupied", "maintenance", "reserved"]),
    body("occupied").optional().isInt({ min: 0 }),
    validate,
  ],
  ctrl.updateSpace,
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  [param("id").isMongoId(), validate],
  ctrl.deleteSpace,
);

export default router;
