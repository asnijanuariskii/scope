'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) { router.replace('/leads'); return null; }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<{ data: { access_token: string; refresh_token: string } }>('/auth/login', { employee_id: employeeId });
      login(res.data.data.access_token, res.data.data.refresh_token);
      router.replace('/leads');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <div className="m3-card-elevated p-8 w-[400px] rounded-xl shadow-elevation-2">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-on font-bold text-title-lg">S</div>
          <h1 className="text-headline-sm font-semibold text-on-surface">SCO Lead<br/>Management</h1>
        </div>

        {error && (
          <div className="text-body-sm text-error bg-error-container p-3 rounded-md mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block text-label-md text-on-surface-variant mb-1.5">Employee ID</label>
          <input
            className="m3-input mb-5"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
            placeholder="Masukkan Employee ID"
          />
          <button type="submit" disabled={loading} className="m3-btn-filled w-full">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
