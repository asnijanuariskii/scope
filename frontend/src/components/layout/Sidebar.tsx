import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <nav className="tds-sidebar">
      <div className="tds-sidebar__brand">SCO Leads</div>
      <NavLink to="/leads" className={({ isActive }) => `tds-sidebar__link ${isActive ? 'tds-sidebar__link--active' : ''}`}>
        Leads
      </NavLink>
      {user?.role === Role.SUPERADMIN && (
        <NavLink to="/users" className={({ isActive }) => `tds-sidebar__link ${isActive ? 'tds-sidebar__link--active' : ''}`}>
          Users
        </NavLink>
      )}
    </nav>
  );
}
