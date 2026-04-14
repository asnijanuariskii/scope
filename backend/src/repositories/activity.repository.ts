import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const activityRepository = {
  create(data: Prisma.ActivityUncheckedCreateInput) {
    return prisma.activity.create({ data });
  },

  findByLeadId(leadId: string) {
    return prisma.activity.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.activity.findUnique({ where: { id } });
  },

  update(id: string, data: Prisma.ActivityUpdateInput) {
    return prisma.activity.update({ where: { id }, data });
  },
};
