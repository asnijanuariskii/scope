import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { UnauthorizedError } from '../errors';

const router = Router();

// POST /login — Authenticate user by employee_id, return access + refresh tokens
router.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { employee_id } = req.body;

      if (!employee_id) {
        throw new UnauthorizedError('employee_id wajib diisi');
      }

      const user = await userRepository.findByEmployeeId(employee_id);
      if (!user) {
        throw new UnauthorizedError('User tidak ditemukan');
      }

      const jwtSecret = process.env.JWT_SECRET;
      const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
      if (!jwtSecret || !jwtRefreshSecret) {
        throw new Error('JWT secrets are not configured');
      }

      const payload = {
        userId: user.id,
        role: user.role,
        employeeId: user.employeeId,
      };

      const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
      const refreshToken = jwt.sign(payload, jwtRefreshSecret, { expiresIn: '7d' });

      res.status(200).json({
        success: true,
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /refresh — Verify refresh token, return new access token
router.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        throw new UnauthorizedError('refresh_token wajib diisi');
      }

      const jwtSecret = process.env.JWT_SECRET;
      const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
      if (!jwtSecret || !jwtRefreshSecret) {
        throw new Error('JWT secrets are not configured');
      }

      const decoded = jwt.verify(refresh_token, jwtRefreshSecret) as {
        userId: string;
        role: string;
        employeeId: string;
      };

      const payload = {
        userId: decoded.userId,
        role: decoded.role,
        employeeId: decoded.employeeId,
      };

      const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

      res.status(200).json({
        success: true,
        data: {
          access_token: accessToken,
        },
      });
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        return next(new UnauthorizedError('Refresh token tidak valid'));
      }
      next(err);
    }
  }
);

export default router;
