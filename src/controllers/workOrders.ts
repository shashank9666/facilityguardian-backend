import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { WorkOrder } from "../models/WorkOrder";

// GET /api/work-orders
export async function getWorkOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, priority, type, assignedTo, q, page = "1", limit = "50" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (status)     filter.status     = status;
    if (priority)   filter.priority   = priority;
    if (type)       filter.type       = type;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (q)          filter.$text      = { $search: q };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [workOrders, total] = await Promise.all([
      WorkOrder.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      WorkOrder.countDocuments(filter),
    ]);
    res.json({ success: true, data: workOrders, total, page: parseInt(page) });
  } catch (err) { next(err); }
}

// GET /api/work-orders/:id
export async function getWorkOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) { res.status(404).json({ success: false, message: "Work order not found" }); return; }
    res.json({ success: true, data: wo });
  } catch (err) { next(err); }
}

// POST /api/work-orders
export async function createWorkOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const wo = await WorkOrder.create({
      ...req.body,
      requestedBy: req.body.requestedBy ?? req.user?.name ?? "system",
      auditLog: [{ action: "created", performedBy: req.user?.name ?? "system", timestamp: new Date() }],
    });
    res.status(201).json({ success: true, data: wo });
  } catch (err) { next(err); }
}

// PATCH /api/work-orders/:id
export async function updateWorkOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, ...rest } = req.body;
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) { res.status(404).json({ success: false, message: "Work order not found" }); return; }

    Object.assign(wo, rest);
    if (status && status !== wo.status) {
      wo.status = status;
      if (status === "in_progress" && !wo.startedAt) wo.startedAt = new Date();
      if (status === "completed"   && !wo.completedAt) wo.completedAt = new Date();
      wo.auditLog.push({ action: `status → ${status}`, performedBy: req.user?.name ?? "system", timestamp: new Date() });
    }
    await wo.save();
    res.json({ success: true, data: wo });
  } catch (err) { next(err); }
}

// DELETE /api/work-orders/:id
export async function deleteWorkOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const wo = await WorkOrder.findByIdAndDelete(req.params.id);
    if (!wo) { res.status(404).json({ success: false, message: "Work order not found" }); return; }
    res.json({ success: true, message: "Work order deleted" });
  } catch (err) { next(err); }
}
