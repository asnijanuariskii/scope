import { leadRepository } from '../repositories/lead.repository';
import { tipeLeadRepository } from '../repositories/tipe-lead.repository';
import { auditTrailService } from './audit-trail.service';
import { ConflictError, NotFoundError, ValidationError } from '../errors';
import type { CreateLeadInput, UpdateLeadInput, LeadFilterInput } from '../validators/lead.validator';
import type { AuthUser } from '../middleware/auth';
import type { Prisma } from '@prisma/client';

export const leadService = {
  async create(data: CreateLeadInput, userId: string) {
    const trimmedNamaEo = data.nama_eo.trim();

    const existing = await leadRepository.findByNamaEo(trimmedNamaEo);
    if (existing) {
      throw new ConflictError(`Lead dengan nama_eo "${trimmedNamaEo}" sudah ada`);
    }

    const tipe = await tipeLeadRepository.findById(data.tipe_id);
    if (!tipe) {
      throw new ValidationError(`Tipe Lead dengan ID ${data.tipe_id} tidak ditemukan`);
    }

    const lead = await leadRepository.create({
      namaEo: trimmedNamaEo,
      tipe: { connect: { id: data.tipe_id } },
      alamat: data.alamat,
      speciality: data.speciality ?? null,
      linkSosmed: data.link_sosmed || null,
      creator: { connect: { id: userId } },
      statuses: {
        create: {
          status: 'NEW_LEAD',
          updater: { connect: { id: userId } },
        },
      },
    });

    await auditTrailService.log({
      entityName: 'Lead',
      entityId: lead.id,
      changedBy: userId,
      previousValue: null,
      newValue: {
        namaEo: lead.namaEo,
        tipeId: lead.tipeId,
        alamat: lead.alamat,
        speciality: lead.speciality,
        linkSosmed: lead.linkSosmed,
      },
    });

    return lead;
  },

  async findAll(filters: LeadFilterInput, user: AuthUser) {
    const { status, pic_id, tipe_id, last_activity_from, last_activity_to, search, page, limit } = filters;

    const where: Prisma.LeadWhereInput = { isDeleted: false };

    // PIC role: only show leads assigned to them
    if (user.role === 'PIC') {
      where.assignments = {
        some: { picId: user.userId, isActive: true },
      };
    }

    // Filter by status: find leads whose latest status matches
    if (status) {
      where.statuses = {
        some: { status },
      };
    }

    // Filter by PIC assignment
    if (pic_id) {
      where.assignments = {
        ...where.assignments as object,
        some: {
          ...(where.assignments as { some?: object })?.some as object,
          picId: pic_id,
          isActive: true,
        },
      };
    }

    // Filter by tipe
    if (tipe_id) {
      where.tipeId = tipe_id;
    }

    // Filter by last activity date range
    if (last_activity_from || last_activity_to) {
      where.lastActivityDate = {};
      if (last_activity_from) {
        where.lastActivityDate.gte = new Date(last_activity_from);
      }
      if (last_activity_to) {
        where.lastActivityDate.lte = new Date(last_activity_to);
      }
    }

    // Search by nama_eo (case-insensitive)
    if (search) {
      where.namaEo = { contains: search, mode: 'insensitive' };
    }

    const skip = (page - 1) * limit;
    const orderBy: Prisma.LeadOrderByWithRelationInput = { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      leadRepository.findAll(where, orderBy, skip, limit),
      leadRepository.count(where),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string, user: AuthUser) {
    const lead = await leadRepository.findById(id);
    if (!lead) {
      throw new NotFoundError('Lead', id);
    }

    // PIC can only view leads assigned to them
    if (user.role === 'PIC') {
      const isAssigned = lead.assignments.some(
        (a) => a.picId === user.userId && a.isActive,
      );
      if (!isAssigned) {
        throw new NotFoundError('Lead', id);
      }
    }

    return lead;
  },

  async update(id: string, data: UpdateLeadInput, userId: string) {
    const lead = await leadRepository.findById(id);
    if (!lead) {
      throw new NotFoundError('Lead', id);
    }

    // Check nama_eo uniqueness if changed
    if (data.nama_eo !== undefined) {
      const trimmedNamaEo = data.nama_eo.trim();
      const existing = await leadRepository.findByNamaEo(trimmedNamaEo);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Lead dengan nama_eo "${trimmedNamaEo}" sudah ada`);
      }
    }

    // Validate tipe_id if changed
    if (data.tipe_id !== undefined) {
      const tipe = await tipeLeadRepository.findById(data.tipe_id);
      if (!tipe) {
        throw new ValidationError(`Tipe Lead dengan ID ${data.tipe_id} tidak ditemukan`);
      }
    }

    const previousValue = {
      namaEo: lead.namaEo,
      tipeId: lead.tipeId,
      alamat: lead.alamat,
      speciality: lead.speciality,
      linkSosmed: lead.linkSosmed,
    };

    const updated = await leadRepository.update(id, {
      ...(data.nama_eo !== undefined && { namaEo: data.nama_eo.trim() }),
      ...(data.tipe_id !== undefined && { tipeId: data.tipe_id }),
      ...(data.alamat !== undefined && { alamat: data.alamat }),
      ...(data.speciality !== undefined && { speciality: data.speciality ?? null }),
      ...(data.link_sosmed !== undefined && { linkSosmed: data.link_sosmed || null }),
    });

    await auditTrailService.log({
      entityName: 'Lead',
      entityId: id,
      changedBy: userId,
      previousValue,
      newValue: {
        namaEo: updated.namaEo,
        tipeId: updated.tipeId,
        alamat: updated.alamat,
        speciality: updated.speciality,
        linkSosmed: updated.linkSosmed,
      },
    });

    return updated;
  },

  async softDelete(id: string, userId: string) {
    const lead = await leadRepository.findById(id);
    if (!lead) {
      throw new NotFoundError('Lead', id);
    }

    const result = await leadRepository.softDelete(id);

    await auditTrailService.log({
      entityName: 'Lead',
      entityId: id,
      changedBy: userId,
      previousValue: { isDeleted: false },
      newValue: { isDeleted: true },
    });

    return result;
  },
};
