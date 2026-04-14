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
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-2xl shadow-card p-8 w-[400px]">
        <h1 className="text-2xl font-bold text-center mb-6">SCO Lead Management</h1>
        {error && <div className="text-sm text-r-400 bg-r-100 p-3 rounded-lg mb-4" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="block text-xs text-n-600 mb-1">Employee ID</label>
          <input
            className="w-full border border-n-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-b-400 focus:ring-2 focus:ring-b-100 mb-4"
            value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}
            required placeholder="Masukkan Employee ID"
          />
          <button
            type="submit" disabled={loading}
            className="w-full bg-brand text-white font-semibold py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-40 transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
