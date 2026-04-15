'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconPlus } from '@tabler/icons-react';
import api from '@/services/api';
import type { User, Role } from '@/types';
import Select from '@/components/shared/Select';

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
      <div className="ads-card">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-N-30">
          <h1 className="text-heading-lg text-N-800">User Management</h1>
          <button onClick={() => setOpen(true)} className="ads-btn">
            <IconPlus size={16} stroke={2} /> Tambah User
          </button>
        </div>

        <div className="ads-table-wrapper">
        <table className="ads-table">
          <thead><tr>
            <th className="text-center w-12">NO</th><th>Nama</th><th>Employee ID</th><th>No. Telepon</th><th>Role</th><th className="text-center">Aksi</th>
          </tr></thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="py-12 text-center text-N-200">Memuat...</td></tr>}
            {!isLoading && !active.length && <tr><td colSpan={6} className="py-12 text-center text-N-200">Belum ada user.</td></tr>}
            {active.map((u, i) => (
              <tr key={u.id}>
                <td className="text-center text-N-200">{i + 1}</td>
                <td className="font-medium">{u.nama}</td>
                <td>{u.employeeId}</td>
                <td>{u.phoneNumber}</td>
                <td><span className="ads-lozenge bg-discovery-subtle text-discovery-text">{u.role}</span></td>
                <td className="text-center">
                  <button onClick={() => { if (confirm(`Hapus "${u.nama}"?`)) deleteMut.mutate(u.id); }}
                    className="ads-btn-danger text-body-sm h-7 px-2">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {open && (
        <div className="ads-dialog-overlay" onClick={() => setOpen(false)}>
          <div className="ads-dialog w-[440px]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-heading-md text-N-800 mb-5">Tambah User Baru</h2>
            <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }}>
              <Field label="Nama" value={form.nama} onChange={(v) => setForm({ ...form, nama: v })} />
              <Field label="Employee ID" value={form.employee_id} onChange={(v) => setForm({ ...form, employee_id: v })} />
              <Field label="No. Telepon" value={form.phone_number} onChange={(v) => setForm({ ...form, phone_number: v })} />
              <Select
                label="Role"
                options={[
                  { value: 'SUPERADMIN', label: 'Superadmin' },
                  { value: 'SUPERIOR', label: 'Superior' },
                  { value: 'PIC', label: 'PIC' },
                ]}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role | '' })}
                placeholder="— Pilih Role —"
              />
              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={() => setOpen(false)} className="ads-btn-default">Batal</button>
                <button type="submit" disabled={createMut.isPending} className="ads-btn">
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
      <label className="block text-label-md text-N-300 mb-2">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="ads-input mb-4" />
    </>
  );
}
