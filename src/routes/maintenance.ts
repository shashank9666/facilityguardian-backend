import { Router } from "express";
import { body, param, query } from "express-validator";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import * as ctrl from "../controllers/maintenance";

const router = Router();

router.get(
  "/",
  authenticate,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 200 }),
    query("status").optional().isIn(["active", "paused", "overdue"]),
    query("frequency").optional().isIn(["daily", "weekly", "monthly", "quarterly", "semi-annual", "annual"]),
    query("assetId").optional().isMongoId(),
    validate,
  ],
  ctrl.getSchedules,
);

router.get("/:id", authenticate, [param("id").isMongoId(), validate], ctrl.getSchedule);

router.post(
  "/",
  authenticate,
  requireRole("manager"),
  [
    body("title").notEmpty().trim().escape(),
    body("assetId").isMongoId(),
    body("frequency").isIn(["daily", "weekly", "monthly", "quarterly", "semi-annual", "annual"]),
    body("nextDue").isISO8601(),
    body("assignedTo").notEmpty().trim().escape(),
    body("checklist").isArray({ min: 1 }),
    body("checklist.*.task").notEmpty().trim().escape(),
    validate,
  ],
  ctrl.createSchedule,
);

router.patch(
  "/:id",
  authenticate,
  requireRole("technician"),
  [
    param("id").isMongoId(),
    body("status").optional().isIn(["active", "paused", "overdue"]),
    body("frequency").optional().isIn(["daily", "weekly", "monthly", "quarterly", "semi-annual", "annual"]),
    validate,
  ],
  ctrl.updateSchedule,
);

router.patch(
  "/:id/complete",
  authenticate,
  requireRole("technician"),
  [param("id").isMongoId(), validate],
  ctrl.completeSchedule,
);

router.delete(
  "/:id",
  authenticate,
  requireRole("manager"),
  [param("id").isMongoId(), validate],
  ctrl.deleteSchedule,
);

export default router;
