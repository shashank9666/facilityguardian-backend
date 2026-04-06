import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

type Role = "admin" | "manager" | "technician" | "viewer";

const ROLE_HIERARCHY: Record<Role, number> = {
  admin:      4,
  manager:    3,
  technician: 2,
  viewer:     1,
};

/** Allow access if user has at least the required role level */
export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role as Role | undefined;
    if (!userRole) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }
    const allowed = roles.some(r => ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[r]);
    if (!allowed) {
      res.status(403).json({ success: false, message: `Requires one of: ${roles.join(", ")}` });
      return;
    }
    next();
  };
}
