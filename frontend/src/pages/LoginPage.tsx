import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/shared';
import api from '../services/api';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/leads" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<{ data: { access_token: string; refresh_token: string } }>('/auth/login', { employee_id: employeeId });
      login(res.data.data.access_token, res.data.data.refresh_token);
      navigate('/leads', { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tds-login">
      <div className="tds-card tds-login__card">
        <h1 className="tds-login__title">SCO Lead Management</h1>
        {error && <div className="tds-login__alert" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <Input label="Employee ID" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required autoComplete="username" placeholder="Masukkan Employee ID" />
          <Button type="submit" loading={loading} fullWidth style={{ marginTop: 8 }}>Login</Button>
        </form>
      </div>
    </div>
  );
}
