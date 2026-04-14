import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '../components/layout/MainLayout';
import { Button, Modal, Input, Select } from '../components/shared';
import api from '../services/api';
import type { User, Role } from '../types';

interface CreateUserForm { nama: string; employee_id: string; phone_number: string; role: Role | ''; }
const emptyForm: CreateUserForm = { nama: '', employee_id: '', phone_number: '', role: '' };
const roleOptions = [{ value: 'SUPERADMIN', label: 'Superadmin' }, { value: 'SUPERIOR', label: 'Superior' }, { value: 'PIC', label: 'PIC' }];

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateUserForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateUserForm, string>>>({});

  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => { const res = await api.get('/users'); return res.data.data ?? res.data; },
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<CreateUserForm, 'role'> & { role: Role }) => api.post('/users', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); },
  });

  function closeModal() { setModalOpen(false); setForm(emptyForm); setFormErrors({}); }

  function validate(): boolean {
    const e: Partial<Record<keyof CreateUserForm, string>> = {};
    if (!form.nama.trim()) e.nama = 'Nama wajib diisi';
    if (!form.employee_id.trim()) e.employee_id = 'Employee ID wajib diisi';
    if (!form.phone_number.trim()) e.phone_number = 'No. Telepon wajib diisi';
    if (!form.role) e.role = 'Role wajib dipilih';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate({ nama: form.nama.trim(), employee_id: form.employee_id.trim(), phone_number: form.phone_number.trim(), role: form.role as Role });
  }

  const activeUsers = users.filter((u) => !u.isDeleted);

  return (
    <MainLayout>
      <div className="tds-page-header">
        <h1 className="tds-page-header__title">User Management</h1>
        <Button className="tds-btn--add" onClick={() => setModalOpen(true)}>+ Tambah User</Button>
      </div>

      {isLoading && <div className="tds-loading">Memuat data user...</div>}
      {error && <div className="tds-error">Gagal memuat data user.</div>}

      {!isLoading && !error && (
        <div className="tds-table-card">
        <table className="tds-table">
          <thead><tr><th style={{ width: 48, textAlign: 'center' }}>NO</th><th>Nama</th><th>Employee ID</th><th>No. Telepon</th><th>Role</th><th style={{ textAlign: 'center' }}>Aksi</th></tr></thead>
          <tbody>
            {activeUsers.length === 0 ? (
              <tr><td colSpan={6} className="tds-table__empty">Belum ada user.</td></tr>
            ) : activeUsers.map((user, idx) => (
              <tr key={user.id}>
                <td className="tds-table__no">{idx + 1}</td>
                <td style={{ fontWeight: 600 }}>{user.nama}</td>
                <td>{user.employeeId}</td>
                <td>{user.phoneNumber}</td>
                <td><span className="tds-badge tds-badge--blue">{user.role}</span></td>
                <td style={{ textAlign: 'center' }}>
                  <Button variant="danger" size="sm" onClick={() => { if (window.confirm(`Hapus user "${user.nama}"?`)) deleteMutation.mutate(user.id); }}>Hapus</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      <Modal open={modalOpen} title="Tambah User Baru" onClose={closeModal}>
        <form onSubmit={handleSubmit}>
          <Input label="Nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} error={formErrors.nama} />
          <Input label="Employee ID" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} error={formErrors.employee_id} />
          <Input label="No. Telepon" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} error={formErrors.phone_number} />
          <Select label="Role" options={roleOptions} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role | '' })} error={formErrors.role} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button variant="secondary" type="button" onClick={closeModal}>Batal</Button>
            <Button type="submit" loading={createMutation.isPending}>Simpan</Button>
          </div>
          {createMutation.isError && <div className="tds-error" style={{ marginTop: 8 }}>Gagal membuat user. Pastikan data valid dan Employee ID belum digunakan.</div>}
        </form>
      </Modal>
    </MainLayout>
  );
}
