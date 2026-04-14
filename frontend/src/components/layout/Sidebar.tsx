import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <nav className="tds-sidebar">
      <div className="tds-sidebar__brand">
        <div className="tds-sidebar__brand-icon">S</div>
        <div className="tds-sidebar__brand-text">SCO Lead<br/>Management</div>
      </div>

      <NavLink to="/leads" className={({ isActive }) => `tds-sidebar__link ${isActive ? 'tds-sidebar__link--active' : ''}`}>
        <span className="tds-sidebar__icon">📋</span> Leads
      </NavLink>

      {(user?.role === Role.SUPERADMIN || user?.role === Role.SUPERIOR) && (
        <NavLink to="/leads" end className={({ isActive }) => `tds-sidebar__link ${!isActive ? '' : ''}`}>
          <span className="tds-sidebar__icon">📊</span> Pipeline
        </NavLink>
      )}

      {user?.role === Role.SUPERADMIN && (
        <>
          <div className="tds-sidebar__section">Master</div>
          <NavLink to="/users" className={({ isActive }) => `tds-sidebar__link ${isActive ? 'tds-sidebar__link--active' : ''}`}>
            <span className="tds-sidebar__icon">👤</span> Users
          </NavLink>
        </>
      )}
    </nav>
  );
}
