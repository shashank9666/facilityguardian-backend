import { Request, Response, NextFunction } from "express";
import { PMSchedule } from "../models/PMSchedule";

// GET /api/maintenance
export async function getSchedules(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, frequency, assetId, page = "1", limit = "50" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (status)    filter.status    = status;
    if (frequency) filter.frequency = frequency;
    if (assetId)   filter.assetId   = assetId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [schedules, total] = await Promise.all([
      PMSchedule.find(filter).sort({ nextDue: 1 }).skip(skip).limit(parseInt(limit)),
      PMSchedule.countDocuments(filter),
    ]);
    res.json({ success: true, data: schedules, total, page: parseInt(page) });
  } catch (err) { next(err); }
}

// GET /api/maintenance/:id
export async function getSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const schedule = await PMSchedule.findById(req.params.id);
    if (!schedule) { res.status(404).json({ success: false, message: "PM schedule not found" }); return; }
    res.json({ success: true, data: schedule });
  } catch (err) { next(err); }
}

// POST /api/maintenance
export async function createSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const schedule = await PMSchedule.create(req.body);
    res.status(201).json({ success: true, data: schedule });
  } catch (err) { next(err); }
}

// PATCH /api/maintenance/:id
export async function updateSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const schedule = await PMSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!schedule) { res.status(404).json({ success: false, message: "PM schedule not found" }); return; }
    res.json({ success: true, data: schedule });
  } catch (err) { next(err); }
}

// PATCH /api/maintenance/:id/complete — mark task done, advance nextDue
export async function completeSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const schedule = await PMSchedule.findById(req.params.id);
    if (!schedule) { res.status(404).json({ success: false, message: "PM schedule not found" }); return; }

    schedule.lastCompleted = new Date();
    schedule.status        = "active";

    // advance nextDue based on frequency
    const next = new Date();
    const freqDays: Record<string, number> = {
      daily: 1, weekly: 7, monthly: 30, quarterly: 90, "semi-annual": 180, annual: 365,
    };
    const days = freqDays[schedule.frequency] ?? 30;
    next.setDate(next.getDate() + days);
    schedule.nextDue = next;

    // reset checklist items for the fresh cycle
    schedule.checklist.forEach((item: { completed: boolean }) => { item.completed = false; });
    await schedule.save();
    res.json({ success: true, data: schedule });
  } catch (err) { next(err); }
}

// DELETE /api/maintenance/:id
export async function deleteSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const schedule = await PMSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) { res.status(404).json({ success: false, message: "PM schedule not found" }); return; }
    res.json({ success: true, message: "PM schedule deleted" });
  } catch (err) { next(err); }
}
