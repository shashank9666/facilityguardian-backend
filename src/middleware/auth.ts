import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload { id: string; iat: number; exp: number; }

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "No token provided" });
      return;
    }

    const token = header.slice(7);
    const secret = process.env.JWT_SECRET ?? "fallback-secret";
    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findById(decoded.id).select("+active");
    if (!user || !user.active) {
      res.status(401).json({ success: false, message: "Invalid or inactive user" });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Token invalid or expired" });
  }
}
