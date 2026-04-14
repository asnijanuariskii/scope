import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { auditTrailService } from '../services/audit-trail.service';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// GET / — Get audit trail for a Lead (Superadmin and Superior only)
router.get(
  '/',
  authorize(Role.SUPERADMIN, Role.SUPERIOR),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { leadId } = req.params;
      const auditTrail = await auditTrailService.getByLead(leadId);

      res.status(200).json({ success: true, data: auditTrail });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
