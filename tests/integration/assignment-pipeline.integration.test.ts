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

const SUPERIOR_USER = {
  id: 'user-sup-001',
  nama: 'Superior Test',
  employeeId: 'EMP-SUP-001',
  phoneNumber: '08123456789',
  role: 'SUPERIOR',
  isDeleted: false,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const PIC_USER = {
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

const PIC_USER_2 = {
  id: 'user-pic-002',
  nama: 'PIC Test 2',
  employeeId: 'EMP-PIC-002',
  phoneNumber: '08123456791',
  role: 'PIC',
  isDeleted: false,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const LEAD = {
  id: 'lead-001',
  namaEo: 'PT Test',
  tipeId: 'tipe-001',
  alamat: 'Jl. Test',
  speciality: null,
  linkSosmed: null,
  lastActivityDate: null,
  lastActivityType: null,
  isDeleted: false,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: SUPERIOR_USER.id,
  tipe: { id: 'tipe-001', nama: 'EO' },
  contacts: [],
  assignments: [],
  statuses: [{ id: 'status-001', status: 'NEW_LEAD', updatedAt: new Date(), updatedBy: SUPERIOR_USER.id }],
  activities: [],
};

function generateToken(user: { id: string; role: string; employeeId: string }) {
  return jwt.sign(
    { userId: user.id, role: user.role, employeeId: user.employeeId },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' },
  );
}

const supToken = generateToken(SUPERIOR_USER);
const picToken = generateToken(PIC_USER);

describe('Assignment & Pipeline Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Assign PIC → Create Activity → Update Status flow', () => {
    it('should assign PIC to a lead', async () => {
      // Mock: lead exists
      mockPrisma.lead.findFirst.mockResolvedValue(LEAD);
      // Mock: PIC user exists with role PIC
      mockPrisma.user.findFirst.mockResolvedValue(PIC_USER);
      // Mock: no active assignment
      mockPrisma.assignment.findFirst.mockResolvedValue(null);
      // Mock: create assignment
      const newAssignment = {
        id: 'assign-001',
        leadId: LEAD.id,
        picId: PIC_USER.id,
        isActive: true,
        assignedAt: new Date(),
        reassignedAt: null,
        reassignedNotes: null,
        assignedBy: SUPERIOR_USER.id,
        pic: PIC_USER,
      };
      mockPrisma.assignment.create.mockResolvedValue(newAssignment);
      mockPrisma.auditTrail.create.mockResolvedValue({ id: 'audit-001' });

      const res = await request(app)
        .post(`/api/leads/${LEAD.id}/assignments`)
        .set('Authorization', `Bearer ${supToken}`)
        .send({ pic_id: PIC_USER.id });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.picId).toBe(PIC_USER.id);
      expect(res.body.data.isActive).toBe(true);
    });

    it('should create an activity for the assigned lead (PIC)', async () => {
      // Mock: lead ownership check — PIC has active assignment
      mockPrisma.assignment.findFirst.mockResolvedValue({
        id: 'assign-001',
        leadId: LEAD.id,
        picId: PIC_USER.id,
        isActive: true,
      });
      // Mock: lead exists
      mockPrisma.lead.findFirst.mockResolvedValue(LEAD);
      // Mock: create activity
      const newActivity = {
        id: 'activity-001',
        leadId: LEAD.id,
        createdBy: PIC_USER.id,
        activityType: 'CALL',
        notes: 'Called the client',
        nextFollowUpDate: new Date('2025-02-01T00:00:00Z'),
        evidencePath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.activity.create.mockResolvedValue(newActivity);
      mockPrisma.lead.update.mockResolvedValue({ ...LEAD, lastActivityDate: new Date(), lastActivityType: 'CALL' });
      mockPrisma.auditTrail.create.mockResolvedValue({ id: 'audit-002' });

      const res = await request(app)
        .post(`/api/leads/${LEAD.id}/activities`)
        .set('Authorization', `Bearer ${picToken}`)
        .send({
          activity_type: 'CALL',
          notes: 'Called the client',
          next_follow_up_date: '2025-02-01T00:00:00Z',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.activityType).toBe('CALL');
    });

    it('should update lead status after activity exists (Superior)', async () => {
      // Mock: lead with current status NEW_LEAD
      mockPrisma.lead.findFirst.mockResolvedValue({
        ...LEAD,
        statuses: [{ id: 'status-001', status: 'NEW_LEAD', updatedAt: new Date(), updatedBy: SUPERIOR_USER.id }],
      });
      // Mock: lead has activities
      mockPrisma.activity.count.mockResolvedValue(1);
      // Mock: create new status
      const newStatus = {
        id: 'status-002',
        leadId: LEAD.id,
        status: 'CONTACTED',
        updatedAt: new Date(),
        updatedBy: SUPERIOR_USER.id,
      };
      mockPrisma.leadStatus.create.mockResolvedValue(newStatus);
      mockPrisma.auditTrail.create.mockResolvedValue({ id: 'audit-003' });

      const res = await request(app)
        .post(`/api/leads/${LEAD.id}/status`)
        .set('Authorization', `Bearer ${supToken}`)
        .send({ status: 'CONTACTED' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CONTACTED');
    });
  });

  describe('Reassign PIC', () => {
    it('should reassign lead to a new PIC', async () => {
      // Mock: lead exists
      mockPrisma.lead.findFirst.mockResolvedValue(LEAD);
      // Mock: new PIC user exists
      mockPrisma.user.findFirst.mockResolvedValue(PIC_USER_2);
      // Mock: active assignment exists
      const oldAssignment = {
        id: 'assign-001',
        leadId: LEAD.id,
        picId: PIC_USER.id,
        isActive: true,
        assignedAt: new Date(),
        assignedBy: SUPERIOR_USER.id,
        pic: PIC_USER,
      };
      mockPrisma.assignment.findFirst.mockResolvedValue(oldAssignment);

      // Mock: $transaction executes the callback
      const deactivatedAssignment = {
        ...oldAssignment,
        isActive: false,
        reassignedAt: new Date(),
        reassignedNotes: 'Reassigning to PIC 2',
      };
      const newAssignment = {
        id: 'assign-002',
        leadId: LEAD.id,
        picId: PIC_USER_2.id,
        isActive: true,
        assignedAt: new Date(),
        reassignedAt: null,
        reassignedNotes: null,
        assignedBy: SUPERIOR_USER.id,
        pic: PIC_USER_2,
      };

      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        // Provide a mock tx that has the same methods
        const tx = {
          assignment: {
            update: vi.fn().mockResolvedValue(deactivatedAssignment),
            create: vi.fn().mockResolvedValue(newAssignment),
            findFirst: vi.fn(),
          },
          auditTrail: {
            create: vi.fn().mockResolvedValue({ id: 'audit-004' }),
          },
        };
        return fn(tx);
      });

      const res = await request(app)
        .post(`/api/leads/${LEAD.id}/assignments`)
        .set('Authorization', `Bearer ${supToken}`)
        .send({ pic_id: PIC_USER_2.id, notes: 'Reassigning to PIC 2' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.picId).toBe(PIC_USER_2.id);
      expect(res.body.data.isActive).toBe(true);
    });
  });
});
