import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { Input, Select, Button } from '../shared';
import api from '../../services/api';
import type { TipeLead } from '../../types';

const leadSchema = z.object({
  nama_eo: z.string().min(1, 'Nama EO wajib diisi').max(255).trim(),
  tipe_id: z.string().uuid('Pilih tipe lead'),
  alamat: z.string().min(1, 'Alamat wajib diisi').max(500).trim(),
  speciality: z.string().max(255).optional(),
  link_sosmed: z.string().url('Link sosmed harus berupa URL valid').optional().or(z.literal('')),
});

export type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  initialData?: Partial<LeadFormData>;
  onSubmit: (data: LeadFormData) => void;
  loading?: boolean;
}

export default function LeadForm({ initialData, onSubmit, loading = false }: LeadFormProps) {
  const [form, setForm] = useState<LeadFormData>({
    nama_eo: initialData?.nama_eo ?? '', tipe_id: initialData?.tipe_id ?? '',
    alamat: initialData?.alamat ?? '', speciality: initialData?.speciality ?? '',
    link_sosmed: initialData?.link_sosmed ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});
  const [tipeOptions, setTipeOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    api.get<{ success: boolean; data: TipeLead[] }>('/lead-types')
      .then((res) => setTipeOptions(res.data.data.map((t) => ({ value: t.id, label: t.nama }))))
      .catch(() => {});
  }, []);

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = leadSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LeadFormData, string>> = {};
      for (const issue of result.error.issues) { const key = issue.path[0] as keyof LeadFormData; if (!fieldErrors[key]) fieldErrors[key] = issue.message; }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onSubmit(result.data);
  };

  const isEdit = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1" noValidate>
      <Input label="Nama EO" value={form.nama_eo} onChange={(e) => handleChange('nama_eo', e.target.value)} error={errors.nama_eo} required />
      <Select label="Tipe Lead" options={tipeOptions} value={form.tipe_id} onChange={(e) => handleChange('tipe_id', e.target.value)} error={errors.tipe_id} required />
      <Input label="Alamat" value={form.alamat} onChange={(e) => handleChange('alamat', e.target.value)} error={errors.alamat} required />
      <Input label="Speciality" value={form.speciality ?? ''} onChange={(e) => handleChange('speciality', e.target.value)} error={errors.speciality} />
      <Input label="Link Sosmed" value={form.link_sosmed ?? ''} onChange={(e) => handleChange('link_sosmed', e.target.value)} error={errors.link_sosmed} placeholder="https://..." />
      <div className="flex justify-end gap-2 mt-2">
        <Button type="submit" loading={loading}>{isEdit ? 'Simpan Perubahan' : 'Buat Lead'}</Button>
      </div>
    </form>
  );
}
