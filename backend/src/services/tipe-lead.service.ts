import { tipeLeadRepository } from '../repositories/tipe-lead.repository';
import { ConflictError } from '../errors';

export const tipeLeadService = {
  async create(nama: string, userId: string) {
    const existing = await tipeLeadRepository.findByNama(nama);
    if (existing) {
      throw new ConflictError(`Tipe Lead dengan nama "${nama}" sudah ada`);
    }

    return tipeLeadRepository.create({ nama, createdBy: userId });
  },

  async findAll() {
    return tipeLeadRepository.findAll();
  },
};
