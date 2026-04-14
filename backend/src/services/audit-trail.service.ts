import prisma from '../lib/prisma';
import type { Prisma, PrismaClient } from '@prisma/client';

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export interface CreateAuditEntry {
  entityName: string;
  entityId: string;
  changedBy: string;
  previousValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
}

export const auditTrailService = {
  /**
   * Log an audit trail record. Accepts an optional transaction client
   * so callers can include audit logging within their own transactions.
   */
  async log(entry: CreateAuditEntry, tx?: TransactionClient) {
    const client = tx ?? prisma;

    return client.auditTrail.create({
      data: {
        entityName: entry.entityName,
        entityId: entry.entityId,
        changedBy: entry.changedBy,
        previousValue: (entry.previousValue ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        newValue: (entry.newValue ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });
  },

  /**
   * Get all audit trail records for a specific entity, ordered by most recent first.
   */
  async getByEntity(entityName: string, entityId: string) {
    return prisma.auditTrail.findMany({
      where: {
        entityName,
        entityId,
      },
      orderBy: {
        changeTime: 'desc',
      },
      include: {
        changer: {
          select: {
            id: true,
            nama: true,
            employeeId: true,
            role: true,
          },
        },
      },
    });
  },

  /**
   * Get all audit trail records related to a lead.
   * This includes direct Lead changes plus changes to related entities
   * (ContactPerson, Assignment, LeadStatus, Activity) that reference this lead.
   */
  async getByLead(leadId: string) {
    // Get IDs of related entities for this lead
    const [contacts, assignments, statuses, activities] = await Promise.all([
      prisma.contactPerson.findMany({ where: { leadId }, select: { id: true } }),
      prisma.assignment.findMany({ where: { leadId }, select: { id: true } }),
      prisma.leadStatus.findMany({ where: { leadId }, select: { id: true } }),
      prisma.activity.findMany({ where: { leadId }, select: { id: true } }),
    ]);

    const contactIds = contacts.map((c) => c.id);
    const assignmentIds = assignments.map((a) => a.id);
    const statusIds = statuses.map((s) => s.id);
    const activityIds = activities.map((a) => a.id);

    // Build OR conditions for all related entities
    const orConditions: Prisma.AuditTrailWhereInput[] = [
      { entityName: 'Lead', entityId: leadId },
    ];

    if (contactIds.length > 0) {
      orConditions.push({ entityName: 'ContactPerson', entityId: { in: contactIds } });
    }
    if (assignmentIds.length > 0) {
      orConditions.push({ entityName: 'Assignment', entityId: { in: assignmentIds } });
    }
    if (statusIds.length > 0) {
      orConditions.push({ entityName: 'LeadStatus', entityId: { in: statusIds } });
    }
    if (activityIds.length > 0) {
      orConditions.push({ entityName: 'Activity', entityId: { in: activityIds } });
    }

    return prisma.auditTrail.findMany({
      where: {
        OR: orConditions,
      },
      orderBy: {
        changeTime: 'desc',
      },
      include: {
        changer: {
          select: {
            id: true,
            nama: true,
            employeeId: true,
            role: true,
          },
        },
      },
    });
  },

  // No update or delete methods — Audit Trail is immutable (Requirement 10.2)
};
