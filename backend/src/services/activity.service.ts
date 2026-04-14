import { activityRepository } from '../repositories/activity.repository';
import { leadRepository } from '../repositories/lead.repository';
import { auditTrailService } from './audit-trail.service';
import { NotFoundError, ValidationError, ForbiddenError } from '../errors';
import prisma from '../lib/prisma';
import type { CreateActivityInput } from '../validators/activity.validator';

export const activityService = {
  async create(
    leadId: string,
    data: CreateActivityInput,
    userId: string,
    evidencePath?: string,
  ) {
    const lead = await leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundError('Lead', leadId);
    }

    // Double-check notes not empty/whitespace (Zod already trims, but be safe)
    if (!data.notes || data.notes.trim().length === 0) {
      throw new ValidationError('Notes wajib diisi');
    }

    // Visit requires evidence
    if (data.activity_type === 'VISIT' && !evidencePath) {
      throw new ValidationError(
        'Bukti kunjungan wajib diunggah untuk Activity bertipe Visit',
      );
    }

    const activity = await activityRepository.create({
      leadId,
      createdBy: userId,
      activityType: data.activity_type,
      notes: data.notes.trim(),
      nextFollowUpDate: new Date(data.next_follow_up_date),
      evidencePath: evidencePath ?? null,
    });

    // Update lead's lastActivityDate and lastActivityType
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        lastActivityDate: activity.createdAt,
        lastActivityType: activity.activityType,
      },
    });

    await auditTrailService.log({
      entityName: 'Activity',
      entityId: activity.id,
      changedBy: userId,
      previousValue: null,
      newValue: {
        leadId: activity.leadId,
        activityType: activity.activityType,
        notes: activity.notes,
        nextFollowUpDate: activity.nextFollowUpDate,
        evidencePath: activity.evidencePath,
      },
    });

    return activity;
  },

  async findByLead(leadId: string) {
    const lead = await leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundError('Lead', leadId);
    }

    return activityRepository.findByLeadId(leadId);
  },

  async update(id: string, data: Partial<CreateActivityInput>, userId: string) {
    const activity = await activityRepository.findById(id);
    if (!activity) {
      throw new NotFoundError('Activity', id);
    }

    // PIC can only edit their own activities
    if (activity.createdBy !== userId) {
      throw new ForbiddenError(
        'Anda tidak dapat mengedit Activity yang dibuat oleh PIC lain',
      );
    }

    const previousValue = {
      activityType: activity.activityType,
      notes: activity.notes,
      nextFollowUpDate: activity.nextFollowUpDate,
    };

    const updated = await activityRepository.update(id, {
      ...(data.activity_type !== undefined && { activityType: data.activity_type }),
      ...(data.notes !== undefined && { notes: data.notes.trim() }),
      ...(data.next_follow_up_date !== undefined && {
        nextFollowUpDate: new Date(data.next_follow_up_date),
      }),
    });

    await auditTrailService.log({
      entityName: 'Activity',
      entityId: id,
      changedBy: userId,
      previousValue,
      newValue: {
        activityType: updated.activityType,
        notes: updated.notes,
        nextFollowUpDate: updated.nextFollowUpDate,
      },
    });

    return updated;
  },
};
