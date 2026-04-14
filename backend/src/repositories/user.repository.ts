import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const userRepository = {
  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  findAll() {
    return prisma.user.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.user.findFirst({
      where: { id, isDeleted: false },
    });
  },

  findByEmployeeId(employeeId: string) {
    return prisma.user.findFirst({
      where: { employeeId, isDeleted: false },
    });
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  },
};
