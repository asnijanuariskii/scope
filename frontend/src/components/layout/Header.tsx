'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { IconLogout } from '@tabler/icons-react';

const routeNames: Record<string, string> = { '/leads': 'Leads', '/users': 'Users' };

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);
  const title = routeNames[`/${parts[0]}`] || parts[0] || 'Dashboard';
  const isDetail = parts.length > 1;

  return (
    <header className="flex items-center justify-between px-6 pt-6 pb-4">
      <div>
        <p className="text-body-sm text-on-surface-variant">Dashboard › {title}{isDetail ? ' › Detail' : ''}</p>
        <h1 className="text-headline-sm font-semibold text-on-surface">{isDetail ? 'Detail' : title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-label-lg font-semibold text-primary-on-container">
              {user.employeeId.slice(0, 2)}
            </div>
            <div>
              <p className="text-title-sm font-medium text-on-surface">Hello, {user.employeeId}</p>
              <p className="text-body-sm text-on-surface-variant">{user.role}</p>
            </div>
          </div>
        )}
        <button onClick={logout} className="m3-btn-outlined h-9 px-4 text-label-md">
          <IconLogout size={18} stroke={1.5} /> Logout
        </button>
      </div>
    </header>
  );
}
