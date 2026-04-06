import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

/** Express-validator result middleware — returns 422 on first error */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return;
  }
  next();
}
