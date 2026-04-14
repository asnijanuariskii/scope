import { useAuth } from '../../context/AuthContext';
import Button from '../shared/Button';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="tds-header">
      {user && (
        <span className="tds-header__user">
          {user.employeeId} — <span className="tds-header__role">{user.role}</span>
        </span>
      )}
      <Button variant="danger" size="sm" onClick={logout}>Logout</Button>
    </header>
  );
}
