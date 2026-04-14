import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const contactRepository = {
  create(data: Prisma.ContactPersonUncheckedCreateInput) {
    return prisma.contactPerson.create({ data });
  },

  findByLeadId(leadId: string) {
    return prisma.contactPerson.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.contactPerson.findUnique({ where: { id } });
  },

  update(id: string, data: Prisma.ContactPersonUpdateInput) {
    return prisma.contactPerson.update({ where: { id }, data });
  },
};
