import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

const linkStyle: React.CSSProperties = {
  display: 'block',
  padding: '10px 16px',
  color: '#e2e8f0',
  textDecoration: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  transition: 'background 0.15s',
};

const activeLinkStyle: React.CSSProperties = {
  ...linkStyle,
  background: '#2563eb',
  color: '#fff',
  fontWeight: 600,
};

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <nav
      style={{
        width: 220,
        minHeight: '100vh',
        background: '#1e293b',
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div
        style={{
          color: '#fff',
          fontWeight: 700,
          fontSize: 18,
          marginBottom: 24,
          padding: '0 8px',
        }}
      >
        SCO Leads
      </div>

      <NavLink
        to="/leads"
        style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
      >
        Leads
      </NavLink>

      {user?.role === Role.SUPERADMIN && (
        <NavLink
          to="/users"
          style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        >
          Users
        </NavLink>
      )}
    </nav>
  );
}
