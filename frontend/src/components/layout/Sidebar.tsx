import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { IconClipboardList, IconUsers } from '@tabler/icons-react';

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <nav className="tds-sidebar">
      <div className="tds-sidebar__brand">
        <div className="tds-sidebar__brand-icon">S</div>
        <div className="tds-sidebar__brand-text">SCO Lead<br/>Management</div>
      </div>

      <NavLink to="/leads" className={({ isActive }) => `tds-sidebar__link ${isActive ? 'tds-sidebar__link--active' : ''}`}>
        <IconClipboardList size={20} stroke={1.5} /> Leads
      </NavLink>

      {user?.role === Role.SUPERADMIN && (
        <>
          <div className="tds-sidebar__section">Master</div>
          <NavLink to="/users" className={({ isActive }) => `tds-sidebar__link ${isActive ? 'tds-sidebar__link--active' : ''}`}>
            <IconUsers size={20} stroke={1.5} /> Users
          </NavLink>
        </>
      )}
    </nav>
  );
}
