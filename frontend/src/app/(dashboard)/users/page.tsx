'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconPlus } from '@tabler/icons-react';
import api from '@/services/api';
import type { User, Role } from '@/types';

interface CreateUserForm { nama: string; employee_id: string; phone_number: string; role: Role | ''; }
const emptyForm: CreateUserForm = { nama: '', employee_id: '', phone_number: '', role: '' };

export default function UsersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateUserForm>(emptyForm);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => { const res = await api.get('/users'); return res.data.data ?? res.data; },
  });

  const createMut = useMutation({
    mutationFn: (d: CreateUserForm) => api.post('/users', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setOpen(false); setForm(emptyForm); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const active = users.filter((u) => !u.isDeleted);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-sm font-semibold text-on-surface">User Management</h1>
        <button onClick={() => setOpen(true)} className="m3-fab-extended h-10">
          <IconPlus size={18} stroke={2} /> Tambah User
        </button>
      </div>

      <div className="m3-card overflow-hidden">
        <table className="m3-table">
          <thead><tr>
            <th className="text-center w-12">NO</th><th>Nama</th><th>Employee ID</th><th>No. Telepon</th><th>Role</th><th className="text-center">Aksi</th>
          </tr></thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="py-12 text-center text-on-surface-variant">Memuat...</td></tr>}
            {!isLoading && !active.length && <tr><td colSpan={6} className="py-12 text-center text-on-surface-variant">Belum ada user.</td></tr>}
            {active.map((u, i) => (
              <tr key={u.id}>
                <td className="text-center text-on-surface-variant">{i + 1}</td>
                <td className="font-semibold">{u.nama}</td>
                <td>{u.employeeId}</td>
                <td>{u.phoneNumber}</td>
                <td><span className="m3-badge bg-primary-container text-primary-on-container">{u.role}</span></td>
                <td className="text-center">
                  <button onClick={() => { if (confirm(`Hapus "${u.nama}"?`)) deleteMut.mutate(u.id); }}
                    className="m3-btn-text text-error h-8 px-3 text-label-md">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="m3-dialog-overlay" onClick={() => setOpen(false)}>
          <div className="m3-dialog w-[440px]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-headline-sm font-semibold text-on-surface mb-6">Tambah User Baru</h2>
            <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }}>
              <Field label="Nama" value={form.nama} onChange={(v) => setForm({ ...form, nama: v })} />
              <Field label="Employee ID" value={form.employee_id} onChange={(v) => setForm({ ...form, employee_id: v })} />
              <Field label="No. Telepon" value={form.phone_number} onChange={(v) => setForm({ ...form, phone_number: v })} />
              <label className="block text-label-md text-on-surface-variant mb-1.5">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role | '' })}
                className="m3-select mb-5">
                <option value="">— Pilih Role —</option>
                <option value="SUPERADMIN">Superadmin</option>
                <option value="SUPERIOR">Superior</option>
                <option value="PIC">PIC</option>
              </select>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setOpen(false)} className="m3-btn-text">Batal</button>
                <button type="submit" disabled={createMut.isPending} className="m3-btn-filled">
                  {createMut.isPending ? 'Saving...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <>
      <label className="block text-label-md text-on-surface-variant mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="m3-input mb-5" />
    </>
  );
}
