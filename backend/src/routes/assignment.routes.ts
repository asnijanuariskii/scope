import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { assignmentService } from '../services/assignment.service';

const router = Router({ mergeParams: true });

// Inline Zod schema for assignment POST body
const assignBodySchema = z.object({
  pic_id: z.string().uuid(),
  notes: z.string().optional(),
});

// All routes require authentication
router.use(authenticate);

// POST / — Assign or Re-assign Lead to PIC (Superior only)
router.post(
  '/',
  authorize(Role.SUPERIOR),
  validate(assignBodySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { leadId } = req.params;
      const { pic_id, notes } = req.body;

      let assignment;
      if (notes) {
        assignment = await assignmentService.reassign(leadId, pic_id, notes, req.user!.userId);
      } else {
        assignment = await assignmentService.assign(leadId, pic_id, req.user!.userId);
      }

      res.status(201).json({ success: true, data: assignment });
    } catch (err) {
      next(err);
    }
  }
);

// GET / — Get assignment history (Superadmin, Superior)
router.get(
  '/',
  authorize(Role.SUPERADMIN, Role.SUPERIOR),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { leadId } = req.params;
      const history = await assignmentService.getHistory(leadId);
      res.status(200).json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
