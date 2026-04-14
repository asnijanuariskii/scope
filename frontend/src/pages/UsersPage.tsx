import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '../components/layout/MainLayout';
import { Button, Modal, Input, Select } from '../components/shared';
import api from '../services/api';
import type { User, Role } from '../types';

interface CreateUserForm {
  nama: string;
  employee_id: string;
  phone_number: string;
  role: Role | '';
}

const emptyForm: CreateUserForm = { nama: '', employee_id: '', phone_number: '', role: '' };

const roleOptions = [
  { value: 'SUPERADMIN', label: 'Superadmin' },
  { value: 'SUPERIOR', label: 'Superior' },
  { value: 'PIC', label: 'PIC' },
];

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: '#fff',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  borderBottom: '2px solid #e5e7eb',
  fontSize: '13px',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #f3f4f6',
  fontSize: '14px',
  color: '#111827',
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateUserForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateUserForm, string>>>({});

  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data ?? res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<CreateUserForm, 'role'> & { role: Role }) =>
      api.post('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  function closeModal() {
    setModalOpen(false);
    setForm(emptyForm);
    setFormErrors({});
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof CreateUserForm, string>> = {};
    if (!form.nama.trim()) errors.nama = 'Nama wajib diisi';
    if (!form.employee_id.trim()) errors.employee_id = 'Employee ID wajib diisi';
    if (!form.phone_number.trim()) errors.phone_number = 'No. Telepon wajib diisi';
    if (!form.role) errors.role = 'Role wajib dipilih';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate({
      nama: form.nama.trim(),
      employee_id: form.employee_id.trim(),
      phone_number: form.phone_number.trim(),
      role: form.role as Role,
    });
  }

  function handleDelete(user: User) {
    if (window.confirm(`Hapus user "${user.nama}"?`)) {
      deleteMutation.mutate(user.id);
    }
  }

  const activeUsers = users.filter((u) => !u.isDeleted);

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>User Management</h1>
        <Button onClick={() => setModalOpen(true)}>+ Tambah User</Button>
      </div>

      {isLoading && <p>Memuat data user...</p>}
      {error && <p style={{ color: '#dc2626' }}>Gagal memuat data user.</p>}

      {!isLoading && !error && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Nama</th>
              <th style={thStyle}>Employee ID</th>
              <th style={thStyle}>No. Telepon</th>
              <th style={thStyle}>Role</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {activeUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>
                  Belum ada user.
                </td>
              </tr>
            ) : (
              activeUsers.map((user) => (
                <tr key={user.id}>
                  <td style={tdStyle}>{user.nama}</td>
                  <td style={tdStyle}>{user.employeeId}</td>
                  <td style={tdStyle}>{user.phoneNumber}</td>
                  <td style={tdStyle}>{user.role}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <Button variant="danger" onClick={() => handleDelete(user)}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <Modal open={modalOpen} title="Tambah User Baru" onClose={closeModal}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Nama"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            error={formErrors.nama}
          />
          <Input
            label="Employee ID"
            value={form.employee_id}
            onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
            error={formErrors.employee_id}
          />
          <Input
            label="No. Telepon"
            value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            error={formErrors.phone_number}
          />
          <Select
            label="Role"
            options={roleOptions}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role | '' })}
            error={formErrors.role}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button variant="secondary" type="button" onClick={closeModal}>
              Batal
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Simpan
            </Button>
          </div>
          {createMutation.isError && (
            <p style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>
              Gagal membuat user. Pastikan data valid dan Employee ID belum digunakan.
            </p>
          )}
        </form>
      </Modal>
    </MainLayout>
  );
}
