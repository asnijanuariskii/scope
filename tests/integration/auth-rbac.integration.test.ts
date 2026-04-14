import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Mock prisma before importing app
vi.mock('../../backend/src/lib/prisma', () => {
  const mockPrisma = {
    user: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    lead: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    assignment: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    auditTrail: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return { default: mockPrisma, prisma: mockPrisma };
});

// Set env vars before importing app
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';

import app from '../../backend/src/index';
import prisma from '../../backend/src/lib/prisma';

const mockPrisma = prisma as any;

const TEST_USER_SUPERADMIN = {
  id: 'user-sa-001',
  nama: 'Admin Test',
  employeeId: 'EMP-SA-001',
  phoneNumber: '08123456789',
  role: 'SUPERADMIN',
  isDeleted: false,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const TEST_USER_PIC = {
  id: 'user-pic-001',
  nama: 'PIC Test',
  employeeId: 'EMP-PIC-001',
  phoneNumber: '08123456790',
  role: 'PIC',
  isDeleted: false,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function generateToken(user: { id: string; role: string; employeeId: string }) {
  return jwt.sign(
    { userId: user.id, role: user.role, employeeId: user.employeeId },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' },
  );
}

describe('Auth & RBAC Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return access and refresh tokens for valid employee_id', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(TEST_USER_SUPERADMIN);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ employee_id: 'EMP-SA-001' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.access_token).toBeDefined();
      expect(res.body.data.refresh_token).toBeDefined();

      // Verify access token is valid JWT
      const decoded = jwt.verify(res.body.data.access_token, process.env.JWT_SECRET!) as any;
      expect(decoded.userId).toBe(TEST_USER_SUPERADMIN.id);
      expect(decoded.role).toBe('SUPERADMIN');
    });

    it('should return 401 for unknown employee_id', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ employee_id: 'UNKNOWN' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 when employee_id is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Protected endpoints — unauthenticated (401)', () => {
    it('should reject GET /api/leads without token', async () => {
      const res = await request(app).get('/api/leads');
      expect(res.status).toBe(401);
    });

    it('should reject POST /api/leads without token', async () => {
      const res = await request(app).post('/api/leads').send({});
      expect(res.status).toBe(401);
    });

    it('should reject GET /api/users without token', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });

    it('should reject with invalid token', async () => {
      const res = await request(app)
        .get('/api/leads')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });

  describe('RBAC — unauthorized role (403)', () => {
    it('should reject PIC from accessing GET /api/users (Superadmin only)', async () => {
      const token = generateToken(TEST_USER_PIC);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should reject PIC from DELETE /api/leads/:id (Superadmin only)', async () => {
      const token = generateToken(TEST_USER_PIC);

      const res = await request(app)
        .delete('/api/leads/some-lead-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should reject PIC from PUT /api/leads/:id (Superadmin, Superior only)', async () => {
      const token = generateToken(TEST_USER_PIC);

      const res = await request(app)
        .put('/api/leads/some-lead-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ nama_eo: 'Test' });

      expect(res.status).toBe(403);
    });
  });
});
