import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { authorize, checkLeadOwnership } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { upload } from '../middleware/upload';
import { createActivitySchema } from '../validators/activity.validator';
import { activityService } from '../services/activity.service';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// POST / — Create Activity (PIC only, with ownership check)
router.post(
  '/',
  authorize(Role.PIC),
  checkLeadOwnership,
  upload.single('evidence'),
  validate(createActivitySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const leadId = req.params.leadId as string;
      const activity = await activityService.create(
        leadId,
        req.body,
        req.user!.userId,
        req.file?.filename,
      );

      res.status(201).json({ success: true, data: activity });
    } catch (err) {
      next(err);
    }
  },
);

// GET / — List Activities for a Lead (all roles, filtered by ownership)
router.get(
  '/',
  checkLeadOwnership,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const leadId = req.params.leadId as string;
      const activities = await activityService.findByLead(leadId);

      res.status(200).json({ success: true, data: activities });
    } catch (err) {
      next(err);
    }
  },
);

// PUT /:id — Update Activity (PIC only, with ownership check)
router.put(
  '/:id',
  authorize(Role.PIC),
  checkLeadOwnership,
  validate(createActivitySchema.partial()),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activity = await activityService.update(
        req.params.id as string,
        req.body,
        req.user!.userId,
      );

      res.status(200).json({ success: true, data: activity });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
