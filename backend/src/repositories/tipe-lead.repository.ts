import prisma from '../lib/prisma';

export const tipeLeadRepository = {
  create(data: { nama: string; createdBy: string }) {
    return prisma.tipeLead.create({ data });
  },

  findAll() {
    return prisma.tipeLead.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  findByNama(nama: string) {
    return prisma.tipeLead.findFirst({
      where: { nama },
    });
  },

  findById(id: string) {
    return prisma.tipeLead.findFirst({
      where: { id },
    });
  },
};
