import { Request, Response, NextFunction } from "express";
import { Vendor } from "../models/Vendor";

// GET /api/vendors
export async function getVendors(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, category, q, page = "1", limit = "50" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (q)        filter.$text    = { $search: q };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [vendors, total] = await Promise.all([
      Vendor.find(filter).sort({ name: 1 }).skip(skip).limit(parseInt(limit)),
      Vendor.countDocuments(filter),
    ]);
    res.json({ success: true, data: vendors, total, page: parseInt(page) });
  } catch (err) { next(err); }
}

// GET /api/vendors/:id
export async function getVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) { res.status(404).json({ success: false, message: "Vendor not found" }); return; }
    res.json({ success: true, data: vendor });
  } catch (err) { next(err); }
}

// POST /api/vendors
export async function createVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const vendor = await Vendor.create(req.body);
    res.status(201).json({ success: true, data: vendor });
  } catch (err) { next(err); }
}

// PATCH /api/vendors/:id
export async function updateVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vendor) { res.status(404).json({ success: false, message: "Vendor not found" }); return; }
    res.json({ success: true, data: vendor });
  } catch (err) { next(err); }
}

// DELETE /api/vendors/:id
export async function deleteVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) { res.status(404).json({ success: false, message: "Vendor not found" }); return; }
    res.json({ success: true, message: "Vendor deleted" });
  } catch (err) { next(err); }
}
