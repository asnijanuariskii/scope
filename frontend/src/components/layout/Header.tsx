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
        <p className="text-xs text-n-600">Dashboard › {title}{isDetail ? ' › Detail' : ''}</p>
        <h1 className="text-xl font-bold">{isDetail ? 'Detail' : title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-n-200 flex items-center justify-center text-xs font-bold text-n-600">{user.employeeId.slice(0, 2)}</div>
            <div>
              <p className="text-sm font-semibold">Hello, {user.employeeId}</p>
              <p className="text-xs text-n-600">{user.role}</p>
            </div>
          </div>
        )}
        <button onClick={logout} className="flex items-center gap-1.5 text-sm border border-n-200 rounded-lg px-3 py-1.5 hover:bg-n-100 transition-colors">
          <IconLogout size={16} stroke={1.5} /> Logout
        </button>
      </div>
    </header>
  );
}
