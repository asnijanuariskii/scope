import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 16,
        padding: '12px 24px',
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      {user && (
        <span style={{ fontSize: 14, color: '#475569' }}>
          {user.employeeId} — <strong>{user.role}</strong>
        </span>
      )}

      <button
        onClick={logout}
        style={{
          padding: '6px 14px',
          fontSize: 13,
          background: '#ef4444',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </header>
  );
}
