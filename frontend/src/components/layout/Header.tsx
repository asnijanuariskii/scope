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
    <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-N-40">
      <div>
        <p className="text-body-sm text-N-200">Dashboard / {title}{isDetail ? ' / Detail' : ''}</p>
        <h1 className="text-heading-lg text-N-800">{isDetail ? 'Detail' : title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-subtler flex items-center justify-center text-label-md font-semibold text-brand-boldest">
              {user.employeeId.slice(0, 2)}
            </div>
            <div>
              <p className="text-body-md font-medium text-N-800">{user.employeeId}</p>
              <p className="text-body-sm text-N-200">{user.role}</p>
            </div>
          </div>
        )}
        <button onClick={logout} className="ads-btn-default text-body-sm h-8">
          <IconLogout size={16} stroke={1.5} /> Logout
        </button>
      </div>
    </header>
  );
}
