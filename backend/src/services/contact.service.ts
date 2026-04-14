import { contactRepository } from '../repositories/contact.repository';
import { leadRepository } from '../repositories/lead.repository';
import { auditTrailService } from './audit-trail.service';
import { NotFoundError } from '../errors';
import type { CreateContactInput, UpdateContactInput } from '../validators/contact.validator';

export const contactService = {
  async create(leadId: string, data: CreateContactInput, userId: string) {
    const lead = await leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundError('Lead', leadId);
    }

    const contact = await contactRepository.create({
      leadId,
      nama: data.nama,
      noTelp: data.no_telp,
      jabatan: data.jabatan,
    });

    await auditTrailService.log({
      entityName: 'ContactPerson',
      entityId: contact.id,
      changedBy: userId,
      previousValue: null,
      newValue: {
        nama: contact.nama,
        noTelp: contact.noTelp,
        jabatan: contact.jabatan,
        leadId: contact.leadId,
      },
    });

    return contact;
  },

  async findByLead(leadId: string) {
    const lead = await leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundError('Lead', leadId);
    }

    return contactRepository.findByLeadId(leadId);
  },

  async update(id: string, data: UpdateContactInput, userId: string) {
    const contact = await contactRepository.findById(id);
    if (!contact) {
      throw new NotFoundError('Contact Person', id);
    }

    const previousValue = {
      nama: contact.nama,
      noTelp: contact.noTelp,
      jabatan: contact.jabatan,
    };

    const updated = await contactRepository.update(id, {
      ...(data.nama !== undefined && { nama: data.nama }),
      ...(data.no_telp !== undefined && { noTelp: data.no_telp }),
      ...(data.jabatan !== undefined && { jabatan: data.jabatan }),
    });

    await auditTrailService.log({
      entityName: 'ContactPerson',
      entityId: id,
      changedBy: userId,
      previousValue,
      newValue: {
        nama: updated.nama,
        noTelp: updated.noTelp,
        jabatan: updated.jabatan,
      },
    });

    return updated;
  },
};
