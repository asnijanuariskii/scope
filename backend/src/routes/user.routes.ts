import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';
import { userService } from '../services/user.service';

const router = Router();

// All routes require authentication + Superadmin role
router.use(authenticate);
router.use(authorize(Role.SUPERADMIN));

// POST / — Create user
router.post(
  '/',
  validate(createUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.create(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

// GET / — List all users
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.findAll();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

// GET /:id — Get user by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.findById(req.params.id as string);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// PUT /:id — Update user
router.put(
  '/:id',
  validate(updateUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.update(req.params.id as string, req.body);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /:id — Soft delete user
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.softDelete(req.params.id as string);
    res.status(200).json({ success: true, data: { message: 'User berhasil dihapus' } });
  } catch (err) {
    next(err);
  }
});

export default router;
