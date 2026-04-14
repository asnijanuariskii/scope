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
        <h1 className="text-xl font-bold">User Management</h1>
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 bg-brand text-white font-semibold text-sm py-2.5 px-5 rounded-full hover:bg-brand-dark transition-colors">
          <IconPlus size={16} stroke={2} /> Tambah User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-n-200 text-xs text-n-600 uppercase tracking-wide">
            <th className="py-4 px-4 text-center w-12">NO</th><th className="py-4 px-4 text-left">Nama</th><th className="py-4 px-4 text-left">Employee ID</th><th className="py-4 px-4 text-left">No. Telepon</th><th className="py-4 px-4 text-left">Role</th><th className="py-4 px-4 text-center">Aksi</th>
          </tr></thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="py-12 text-center text-n-600">Memuat...</td></tr>}
            {!isLoading && !active.length && <tr><td colSpan={6} className="py-12 text-center text-n-600">Belum ada user.</td></tr>}
            {active.map((u, i) => (
              <tr key={u.id} className="border-b border-n-100 hover:bg-n-100 transition-colors">
                <td className="py-4 px-4 text-center text-n-600">{i + 1}</td>
                <td className="py-4 px-4 font-semibold">{u.nama}</td>
                <td className="py-4 px-4">{u.employeeId}</td>
                <td className="py-4 px-4">{u.phoneNumber}</td>
                <td className="py-4 px-4"><span className="bg-b-100 text-b-400 text-xs font-semibold px-2.5 py-0.5 rounded">{u.role}</span></td>
                <td className="py-4 px-4 text-center">
                  <button onClick={() => { if (confirm(`Hapus "${u.nama}"?`)) deleteMut.mutate(u.id); }} className="text-xs font-semibold text-r-400 bg-r-100 px-3 py-1 rounded hover:bg-r-400 hover:text-white transition-colors">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl p-6 w-[440px] shadow-overlay" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Tambah User Baru</h2>
            <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }}>
              <Field label="Nama" value={form.nama} onChange={(v) => setForm({ ...form, nama: v })} />
              <Field label="Employee ID" value={form.employee_id} onChange={(v) => setForm({ ...form, employee_id: v })} />
              <Field label="No. Telepon" value={form.phone_number} onChange={(v) => setForm({ ...form, phone_number: v })} />
              <label className="block text-xs text-n-600 mb-1">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role | '' })} className="w-full border border-n-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-b-400 focus:ring-2 focus:ring-b-100 mb-4 appearance-none">
                <option value="">— Pilih Role —</option>
                <option value="SUPERADMIN">Superadmin</option>
                <option value="SUPERIOR">Superior</option>
                <option value="PIC">PIC</option>
              </select>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm border border-n-200 rounded-lg hover:bg-n-100 transition-colors">Batal</button>
                <button type="submit" disabled={createMut.isPending} className="px-4 py-2 text-sm bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark disabled:opacity-40 transition-colors">{createMut.isPending ? 'Saving...' : 'Simpan'}</button>
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
      <label className="block text-xs text-n-600 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-n-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-b-400 focus:ring-2 focus:ring-b-100 mb-4" />
    </>
  );
}
