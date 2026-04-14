import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { checkLeadOwnership } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createLeadSchema, updateLeadSchema, leadFilterSchema } from '../validators/lead.validator';
import { leadService } from '../services/lead.service';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST / — Create Lead (Superadmin, Superior, PIC)
router.post(
  '/',
  authorize(Role.SUPERADMIN, Role.SUPERIOR, Role.PIC),
  validate(createLeadSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.create(req.body, req.user!.userId);
      res.status(201).json({ success: true, data: lead });
    } catch (err) {
      next(err);
    }
  }
);

// GET / — List Leads with filters (All authenticated, filtered by role in service)
router.get(
  '/',
  validate(leadFilterSchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await leadService.findAll(req.query as any, req.user!);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// GET /:id — Get Lead detail (All authenticated, ownership check for PIC)
router.get(
  '/:id',
  checkLeadOwnership,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.findById(req.params.id, req.user!);
      res.status(200).json({ success: true, data: lead });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /:id — Update Lead (Superadmin, Superior only)
router.put(
  '/:id',
  authorize(Role.SUPERADMIN, Role.SUPERIOR),
  validate(updateLeadSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.update(req.params.id, req.body, req.user!.userId);
      res.status(200).json({ success: true, data: lead });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /:id — Soft delete Lead (Superadmin only)
router.delete(
  '/:id',
  authorize(Role.SUPERADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await leadService.softDelete(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, data: { message: 'Lead berhasil dihapus' } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
