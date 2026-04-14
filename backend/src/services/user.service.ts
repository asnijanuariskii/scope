import { userRepository } from '../repositories/user.repository';
import { ConflictError, NotFoundError } from '../errors';
import type { CreateUserInput, UpdateUserInput } from '../validators/user.validator';

export const userService = {
  async create(data: CreateUserInput) {
    const existing = await userRepository.findByEmployeeId(data.employee_id);
    if (existing) {
      throw new ConflictError(`User dengan employee_id ${data.employee_id} sudah ada`);
    }

    return userRepository.create({
      nama: data.nama,
      employeeId: data.employee_id,
      phoneNumber: data.phone_number,
      role: data.role,
    });
  },

  async findAll() {
    return userRepository.findAll();
  },

  async findById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }
    return user;
  },

  async update(id: string, data: UpdateUserInput) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }

    if (data.employee_id && data.employee_id !== user.employeeId) {
      const existing = await userRepository.findByEmployeeId(data.employee_id);
      if (existing) {
        throw new ConflictError(`User dengan employee_id ${data.employee_id} sudah ada`);
      }
    }

    return userRepository.update(id, {
      ...(data.nama !== undefined && { nama: data.nama }),
      ...(data.employee_id !== undefined && { employeeId: data.employee_id }),
      ...(data.phone_number !== undefined && { phoneNumber: data.phone_number }),
      ...(data.role !== undefined && { role: data.role }),
    });
  },

  async softDelete(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }

    return userRepository.softDelete(id);
  },
};
