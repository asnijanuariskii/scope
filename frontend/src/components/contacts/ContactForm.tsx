import React, { useState, useEffect } from 'react';
import { Input, Button } from '../shared';

export interface ContactFormData { nama: string; noTelp: string; jabatan: string; }
interface ContactFormProps { initialData?: ContactFormData; onSubmit: (data: ContactFormData) => void; onCancel?: () => void; loading?: boolean; }
const emptyForm: ContactFormData = { nama: '', noTelp: '', jabatan: '' };

export default function ContactForm({ initialData, onSubmit, onCancel, loading = false }: ContactFormProps) {
  const [form, setForm] = useState<ContactFormData>(initialData ?? emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  useEffect(() => { setForm(initialData ?? emptyForm); setErrors({}); }, [initialData]);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.nama.trim()) next.nama = 'Nama wajib diisi';
    if (!form.noTelp.trim()) next.noTelp = 'No. Telp wajib diisi';
    if (!form.jabatan.trim()) next.jabatan = 'Jabatan wajib diisi';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit({ nama: form.nama.trim(), noTelp: form.noTelp.trim(), jabatan: form.jabatan.trim() });
  }

  function handleChange(field: keyof ContactFormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [field]: e.target.value }));
      if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
    };
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Nama" value={form.nama} onChange={handleChange('nama')} error={errors.nama} placeholder="Nama contact person" />
      <Input label="No. Telp" value={form.noTelp} onChange={handleChange('noTelp')} error={errors.noTelp} placeholder="Nomor telepon" />
      <Input label="Jabatan" value={form.jabatan} onChange={handleChange('jabatan')} error={errors.jabatan} placeholder="Jabatan" />
      <div className="flex gap-2 mt-3">
        <Button type="submit" loading={loading}>{initialData ? 'Simpan' : 'Tambah'}</Button>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Batal</Button>}
      </div>
    </form>
  );
}
