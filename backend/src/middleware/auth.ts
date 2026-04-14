import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors";
import { Role } from "@prisma/client";
export interface AuthUser {
  userId: string;
  role: Role;
  employeeId: string;
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError();
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new UnauthorizedError();
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthUser;
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      employeeId: decoded.employeeId,
    };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Token telah kedaluwarsa");
    }
    throw new UnauthorizedError("Token tidak valid");
  }
}
