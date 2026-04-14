import prisma from '../lib/prisma';
import type { Prisma, PrismaClient } from '@prisma/client';

type PrismaTransaction = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export const assignmentRepository = {
  create(data: Prisma.AssignmentUncheckedCreateInput, tx?: PrismaTransaction) {
    const client = tx ?? prisma;
    return client.assignment.create({
      data,
      include: { pic: true },
    });
  },

  findActiveByLeadId(leadId: string, tx?: PrismaTransaction) {
    const client = tx ?? prisma;
    return client.assignment.findFirst({
      where: { leadId, isActive: true },
      include: { pic: true },
    });
  },

  findByLeadId(leadId: string) {
    return prisma.assignment.findMany({
      where: { leadId },
      include: { pic: true },
      orderBy: { assignedAt: 'desc' },
    });
  },

  deactivate(id: string, reassignedNotes: string, tx?: PrismaTransaction) {
    const client = tx ?? prisma;
    return client.assignment.update({
      where: { id },
      data: {
        isActive: false,
        reassignedAt: new Date(),
        reassignedNotes,
      },
    });
  },
};
