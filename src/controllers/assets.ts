import { Request, Response, NextFunction } from "express";
import { Asset } from "../models/Asset";

// GET /api/assets
export async function getAssets(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, category, q, page = "1", limit = "50" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (q)        filter.$text    = { $search: q };

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const [assets, total] = await Promise.all([
      Asset.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Asset.countDocuments(filter),
    ]);
    res.json({ success: true, data: assets, total, page: parseInt(page) });
  } catch (err) { next(err); }
}

// GET /api/assets/:id
export async function getAsset(req: Request, res: Response, next: NextFunction) {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) { res.status(404).json({ success: false, message: "Asset not found" }); return; }
    res.json({ success: true, data: asset });
  } catch (err) { next(err); }
}

// POST /api/assets
export async function createAsset(req: Request, res: Response, next: NextFunction) {
  try {
    const asset = await Asset.create(req.body);
    res.status(201).json({ success: true, data: asset });
  } catch (err) { next(err); }
}

// PATCH /api/assets/:id
export async function updateAsset(req: Request, res: Response, next: NextFunction) {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!asset) { res.status(404).json({ success: false, message: "Asset not found" }); return; }
    res.json({ success: true, data: asset });
  } catch (err) { next(err); }
}

// DELETE /api/assets/:id
export async function deleteAsset(req: Request, res: Response, next: NextFunction) {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) { res.status(404).json({ success: false, message: "Asset not found" }); return; }
    res.json({ success: true, message: "Asset deleted" });
  } catch (err) { next(err); }
}
