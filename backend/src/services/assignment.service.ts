import prisma from '../lib/prisma';
import { assignmentRepository } from '../repositories/assignment.repository';
import { leadRepository } from '../repositories/lead.repository';
import { userRepository } from '../repositories/user.repository';
import { auditTrailService } from './audit-trail.service';
import { ConflictError, NotFoundError, ValidationError } from '../errors';

export const assignmentService = {
  async assign(leadId: string, picId: string, userId: string) {
    const lead = await leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundError('Lead', leadId);
    }

    const pic = await userRepository.findById(picId);
    if (!pic) {
      throw new NotFoundError('User', picId);
    }
    if (pic.role !== 'PIC') {
      throw new ValidationError('User yang di-assign harus memiliki role PIC');
    }

    const activeAssignment = await assignmentRepository.findActiveByLeadId(leadId);
    if (activeAssignment) {
      throw new ConflictError('Lead sudah memiliki PIC aktif. Gunakan reassign untuk mengganti PIC.');
    }

    const assignment = await assignmentRepository.create({
      leadId,
      picId,
      isActive: true,
      assignedBy: userId,
    });

    await auditTrailService.log({
      entityName: 'Assignment',
      entityId: assignment.id,
      changedBy: userId,
      previousValue: null,
      newValue: {
        leadId: assignment.leadId,
        picId: assignment.picId,
        isActive: assignment.isActive,
        assignedBy: assignment.assignedBy,
      },
    });

    return assignment;
  },

  async reassign(leadId: string, newPicId: string, notes: string, userId: string) {
    const lead = await leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundError('Lead', leadId);
    }

    const newPic = await userRepository.findById(newPicId);
    if (!newPic) {
      throw new NotFoundError('User', newPicId);
    }
    if (newPic.role !== 'PIC') {
      throw new ValidationError('User yang di-assign harus memiliki role PIC');
    }

    const activeAssignment = await assignmentRepository.findActiveByLeadId(leadId);
    if (!activeAssignment) {
      throw new NotFoundError('Assignment aktif', leadId);
    }

    // Use transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
      const deactivated = await assignmentRepository.deactivate(activeAssignment.id, notes, tx);

      await auditTrailService.log({
        entityName: 'Assignment',
        entityId: activeAssignment.id,
        changedBy: userId,
        previousValue: { isActive: true },
        newValue: {
          isActive: false,
          reassignedAt: deactivated.reassignedAt,
          reassignedNotes: deactivated.reassignedNotes,
        },
      }, tx);

      const newAssignment = await assignmentRepository.create(
        {
          leadId,
          picId: newPicId,
          isActive: true,
          assignedBy: userId,
        },
        tx,
      );

      await auditTrailService.log({
        entityName: 'Assignment',
        entityId: newAssignment.id,
        changedBy: userId,
        previousValue: null,
        newValue: {
          leadId: newAssignment.leadId,
          picId: newAssignment.picId,
          isActive: newAssignment.isActive,
          assignedBy: newAssignment.assignedBy,
        },
      }, tx);

      return newAssignment;
    });
  },

  async getHistory(leadId: string) {
    const lead = await leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundError('Lead', leadId);
    }

    return assignmentRepository.findByLeadId(leadId);
  },

  async getActiveAssignment(leadId: string) {
    return assignmentRepository.findActiveByLeadId(leadId);
  },
};
