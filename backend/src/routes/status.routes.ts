import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { authorize, checkLeadOwnership } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { updateStatusSchema } from '../validators/status.validator';
import { statusPipelineService } from '../services/status-pipeline.service';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// POST / — Update status Lead (Superadmin, Superior, PIC with ownership check)
router.post(
  '/',
  authorize(Role.SUPERADMIN, Role.SUPERIOR, Role.PIC),
  checkLeadOwnership,
  validate(updateStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const leadId = req.params.leadId as string;
      const { status } = req.body;

      const newStatus = await statusPipelineService.updateStatus(
        leadId,
        status,
        req.user!.userId,
      );

      res.status(201).json({ success: true, data: newStatus });
    } catch (err) {
      next(err);
    }
  },
);

// GET / — Get status history for a Lead (all authenticated roles, PIC with ownership check)
router.get(
  '/',
  checkLeadOwnership,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const leadId = req.params.leadId as string;
      const history = await statusPipelineService.getHistory(leadId);

      res.status(200).json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
