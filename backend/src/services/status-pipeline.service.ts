import { PipelineStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { auditTrailService } from './audit-trail.service';
import { NotFoundError, ValidationError } from '../errors';

/**
 * Status transition map sesuai state machine di design document.
 * Defines allowed transitions from each pipeline status.
 */
export const STATUS_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  NEW_LEAD: [PipelineStatus.CONTACTED],
  CONTACTED: [PipelineStatus.IN_DISCUSSION],
  IN_DISCUSSION: [PipelineStatus.PITCHING, PipelineStatus.ON_HOLD],
  PITCHING: [PipelineStatus.NEGOTIATION, PipelineStatus.LOST],
  NEGOTIATION: [PipelineStatus.DEAL, PipelineStatus.LOST],
  ON_HOLD: [PipelineStatus.IN_DISCUSSION],
  DEAL: [],
  LOST: [],
};

/**
 * Validates whether a status transition is allowed.
 */
export function validateTransition(
  currentStatus: PipelineStatus,
  newStatus: PipelineStatus,
): boolean {
  const allowed = STATUS_TRANSITIONS[currentStatus];
  return allowed?.includes(newStatus) ?? false;
}

export const statusPipelineService = {
  /**
   * Update status Lead sesuai aturan transisi pipeline.
   * - Lead harus ada (not deleted)
   * - Transisi harus valid sesuai STATUS_TRANSITIONS
   * - Lead harus punya minimal 1 Activity sebelum update status
   */
  async updateStatus(leadId: string, newStatus: PipelineStatus, userId: string) {
    // Find lead
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, isDeleted: false },
      include: {
        statuses: { orderBy: { updatedAt: 'desc' }, take: 1 },
      },
    });

    if (!lead) {
      throw new NotFoundError('Lead', leadId);
    }

    // Get current status (latest status record)
    const currentStatus = lead.statuses[0]?.status ?? PipelineStatus.NEW_LEAD;

    // Validate transition
    if (!validateTransition(currentStatus, newStatus)) {
      const allowed = STATUS_TRANSITIONS[currentStatus];
      const allowedStr = allowed.length > 0 ? allowed.join(', ') : 'tidak ada';
      throw new ValidationError(
        `Transisi dari ${currentStatus} ke ${newStatus} tidak diperbolehkan. Transisi yang diizinkan: ${allowedStr}`,
      );
    }

    // Check lead has at least 1 activity
    const activityCount = await prisma.activity.count({
      where: { leadId },
    });

    if (activityCount === 0) {
      throw new ValidationError('Activity harus dibuat sebelum update status');
    }

    // Create new status record
    const newLeadStatus = await prisma.leadStatus.create({
      data: {
        lead: { connect: { id: leadId } },
        status: newStatus,
        updater: { connect: { id: userId } },
      },
    });

    await auditTrailService.log({
      entityName: 'LeadStatus',
      entityId: newLeadStatus.id,
      changedBy: userId,
      previousValue: { status: currentStatus },
      newValue: { status: newStatus },
    });

    return newLeadStatus;
  },

  /**
   * Get status history for a lead, ordered by updatedAt desc.
   */
  async getHistory(leadId: string) {
    // Verify lead exists
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, isDeleted: false },
    });

    if (!lead) {
      throw new NotFoundError('Lead', leadId);
    }

    return prisma.leadStatus.findMany({
      where: { leadId },
      orderBy: { updatedAt: 'desc' },
      include: { updater: { select: { id: true, nama: true, employeeId: true } } },
    });
  },
};
