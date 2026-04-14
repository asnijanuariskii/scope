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
    },
    lead: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    tipeLead: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    assignment: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    contactPerson: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    leadStatus: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    activity: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
    },
    auditTrail: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return { default: mockPrisma, prisma: mockPrisma };
});

process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';

import app from '../../backend/src/index';
import prisma from '../../backend/src/lib/prisma';

const mockPrisma = prisma as any;

const TIPE_EO = {
  id: 'tipe-001',
  nama: 'EO',
  createdAt: new Date(),
  createdBy: 'user-sa-001',
};

const SUPERADMIN_USER = {
  id: 'user-sa-001',
  nama: 'Admin',
  employeeId: 'EMP-SA-001',
  phoneNumber: '08123456789',
  role: 'SUPERADMIN',
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

const saToken = generateToken(SUPERADMIN_USER);

describe('Lead Lifecycle Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create → Get → Update → Soft Delete flow', () => {
    const createdLead = {
      id: 'lead-001',
      namaEo: 'PT Maju Jaya',
      tipeId: TIPE_EO.id,
      alamat: 'Jl. Sudirman No. 1',
      speciality: null,
      linkSosmed: null,
      lastActivityDate: null,
      lastActivityType: null,
      isDeleted: false,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: SUPERADMIN_USER.id,
      tipe: TIPE_EO,
      contacts: [],
      assignments: [],
      statuses: [{ id: 'status-001', status: 'NEW_LEAD', updatedAt: new Date(), updatedBy: SUPERADMIN_USER.id }],
      activities: [],
    };

    it('should create a new lead', async () => {
      // Mock: no duplicate
      mockPrisma.lead.findFirst.mockResolvedValue(null);
      // Mock: tipe exists
      mockPrisma.tipeLead.findFirst.mockResolvedValue(TIPE_EO);
      // Mock: create lead
      mockPrisma.lead.create.mockResolvedValue(createdLead);
      // Mock: audit trail
      mockPrisma.auditTrail.create.mockResolvedValue({ id: 'audit-001' });

      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${saToken}`)
        .send({
          nama_eo: 'PT Maju Jaya',
          tipe_id: TIPE_EO.id,
          alamat: 'Jl. Sudirman No. 1',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.namaEo).toBe('PT Maju Jaya');
    });

    it('should get lead by id', async () => {
      mockPrisma.lead.findFirst.mockResolvedValue(createdLead);

      const res = await request(app)
        .get('/api/leads/lead-001')
        .set('Authorization', `Bearer ${saToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('lead-001');
    });

    it('should update lead', async () => {
      const updatedLead = { ...createdLead, alamat: 'Jl. Thamrin No. 2' };
      mockPrisma.lead.findFirst
        .mockResolvedValueOnce(createdLead) // findById
        .mockResolvedValueOnce(null); // findByNamaEo (no duplicate)
      mockPrisma.lead.update.mockResolvedValue(updatedLead);
      mockPrisma.auditTrail.create.mockResolvedValue({ id: 'audit-002' });

      const res = await request(app)
        .put('/api/leads/lead-001')
        .set('Authorization', `Bearer ${saToken}`)
        .send({ alamat: 'Jl. Thamrin No. 2' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.alamat).toBe('Jl. Thamrin No. 2');
    });

    it('should soft delete lead', async () => {
      const deletedLead = { ...createdLead, isDeleted: true, deletedAt: new Date() };
      mockPrisma.lead.findFirst.mockResolvedValue(createdLead);
      mockPrisma.lead.update.mockResolvedValue(deletedLead);
      mockPrisma.auditTrail.create.mockResolvedValue({ id: 'audit-003' });

      const res = await request(app)
        .delete('/api/leads/lead-001')
        .set('Authorization', `Bearer ${saToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Duplicate nama_eo rejection', () => {
    it('should reject creating lead with duplicate nama_eo', async () => {
      const existingLead = {
        id: 'lead-existing',
        namaEo: 'PT Maju Jaya',
        isDeleted: false,
      };
      // Mock: duplicate found
      mockPrisma.lead.findFirst.mockResolvedValue(existingLead);

      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${saToken}`)
        .send({
          nama_eo: 'PT Maju Jaya',
          tipe_id: TIPE_EO.id,
          alamat: 'Jl. Test',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });
});
