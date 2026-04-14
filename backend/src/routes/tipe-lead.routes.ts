import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { tipeLeadService } from '../services/tipe-lead.service';

const createTipeLeadSchema = z.object({
  nama: z.string().min(1).max(255).trim(),
});

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST / — Create Tipe Lead (Superadmin, Superior only)
router.post(
  '/',
  authorize(Role.SUPERADMIN, Role.SUPERIOR),
  validate(createTipeLeadSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tipeLead = await tipeLeadService.create(req.body.nama, req.user!.userId);
      res.status(201).json({ success: true, data: tipeLead });
    } catch (err) {
      next(err);
    }
  }
);

// GET / — List all Tipe Lead (All authenticated users)
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tipeLeads = await tipeLeadService.findAll();
    res.status(200).json({ success: true, data: tipeLeads });
  } catch (err) {
    next(err);
  }
});

export default router;
