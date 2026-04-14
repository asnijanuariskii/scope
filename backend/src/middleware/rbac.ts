import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { ForbiddenError } from "../errors";
import prisma from "../lib/prisma";

/**
 * Factory function that returns middleware to authorize requests
 * based on the user's role.
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ForbiddenError();
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError();
    }

    next();
  };
}

/**
 * Middleware that verifies Lead ownership for PIC users.
 * - Superadmin and Superior can access all Leads (passes through).
 * - PIC must have an active assignment to the requested Lead.
 */
export async function checkLeadOwnership(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    throw new ForbiddenError();
  }

  // Superadmin and Superior can access all Leads
  if (req.user.role !== Role.PIC) {
    next();
    return;
  }

  const leadId = req.params.leadId || req.params.id;

  if (!leadId) {
    throw new ForbiddenError("Anda tidak memiliki akses ke Lead ini");
  }

  const activeAssignment = await prisma.assignment.findFirst({
    where: {
      leadId,
      picId: req.user.userId,
      isActive: true,
    },
  });

  if (!activeAssignment) {
    throw new ForbiddenError("Anda tidak memiliki akses ke Lead ini");
  }

  next();
}
