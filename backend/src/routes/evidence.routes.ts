import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import { authenticate } from '../middleware/auth';
import { authorize, checkLeadOwnership } from '../middleware/rbac';
import { upload } from '../middleware/upload';
import { activityRepository } from '../repositories/activity.repository';
import { NotFoundError } from '../errors';
import { Role } from '@prisma/client';

const router = Router({ mergeParams: true });

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

/**
 * POST /api/leads/:leadId/activities/:activityId/evidence
 * Upload evidence file for an activity (PIC only, must own the lead)
 */
router.post(
  '/leads/:leadId/activities/:activityId/evidence',
  authenticate,
  authorize(Role.PIC),
  checkLeadOwnership,
  upload.single('evidence'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activityId } = req.params;

      const activity = await activityRepository.findById(activityId);
      if (!activity) {
        throw new NotFoundError('Activity', activityId);
      }

      const file = req.file;
      if (!file) {
        throw new NotFoundError('File', 'evidence');
      }

      // Save the file path to the activity record
      const updated = await activityRepository.update(activityId, {
        evidencePath: file.filename,
      });

      res.status(200).json({
        success: true,
        data: {
          id: updated.id,
          evidencePath: updated.evidencePath,
          filename: file.filename,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/evidence/:filename
 * Serve/download an evidence file (authenticated users)
 */
router.get(
  '/evidence/:filename',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(UPLOAD_DIR, filename);
      res.sendFile(path.resolve(filePath));
    } catch (err) {
      next(err);
    }
  },
);

export default router;
