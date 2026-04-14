import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../shared/Button';
import { IconLogout } from '@tabler/icons-react';

const routeNames: Record<string, string> = {
  '/leads': 'Leads',
  '/users': 'Users',
  '/pipeline': 'Pipeline',
};

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageTitle = routeNames[`/${pathParts[0]}`] || pathParts[0] || 'Dashboard';
  const isDetail = pathParts.length > 1;

  return (
    <header className="tds-header">
      <div className="tds-header__left">
        <div className="tds-header__breadcrumb">
          Dashboard › {pageTitle}{isDetail ? ' › Detail' : ''}
        </div>
        <div className="tds-header__title">{isDetail ? 'Detail' : pageTitle}</div>
      </div>
      <div className="tds-header__right">
        {user && (
          <div className="tds-header__user-info">
            <div className="tds-header__avatar">{user.employeeId.slice(0, 2)}</div>
            <div>
              <div className="tds-header__user-name">Hello, {user.employeeId}</div>
              <div className="tds-header__user-role">{user.role}</div>
            </div>
          </div>
        )}
        <Button variant="secondary" size="sm" onClick={logout}>
          <IconLogout size={16} stroke={1.5} /> Logout
        </Button>
      </div>
    </header>
  );
}
