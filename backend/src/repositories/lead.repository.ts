import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const leadRepository = {
  create(data: Prisma.LeadCreateInput) {
    return prisma.lead.create({ data });
  },

  findAll(
    where: Prisma.LeadWhereInput,
    orderBy: Prisma.LeadOrderByWithRelationInput,
    skip: number,
    take: number,
  ) {
    return prisma.lead.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { tipe: true },
    });
  },

  count(where: Prisma.LeadWhereInput) {
    return prisma.lead.count({ where });
  },

  findById(id: string) {
    return prisma.lead.findFirst({
      where: { id, isDeleted: false },
      include: {
        tipe: true,
        contacts: true,
        assignments: { include: { pic: true } },
        statuses: { orderBy: { updatedAt: 'desc' } },
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });
  },

  findByNamaEo(namaEo: string) {
    return prisma.lead.findFirst({
      where: {
        namaEo: { equals: namaEo, mode: 'insensitive' },
        isDeleted: false,
      },
    });
  },

  update(id: string, data: Prisma.LeadUpdateInput) {
    return prisma.lead.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.lead.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  },
};
