'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';
import { IconClipboardList, IconUsers } from '@tabler/icons-react';

const links = [
  { href: '/leads', label: 'Leads', icon: IconClipboardList, roles: [Role.SUPERADMIN, Role.SUPERIOR, Role.PIC] },
  { href: '/users', label: 'Users', icon: IconUsers, roles: [Role.SUPERADMIN], section: 'Master' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  let lastSection = '';

  return (
    <nav className="w-[240px] bg-white py-6 px-3 flex flex-col sticky top-0 h-screen overflow-y-auto border-r border-N-40 shrink-0">
      <div className="flex items-center gap-2.5 mb-8 px-3">
        <div className="w-8 h-8 bg-brand rounded flex items-center justify-center text-white font-bold text-body-md">S</div>
        <div className="text-heading-xs text-N-800 leading-tight">SCO Lead<br/>Management</div>
      </div>

      <div className="flex flex-col gap-0.5">
        {links.map((link) => {
          if (!user || !link.roles.includes(user.role)) return null;
          const active = pathname.startsWith(link.href);
          const showSection = link.section && link.section !== lastSection;
          if (link.section) lastSection = link.section;
          const Icon = link.icon;

          return (
            <div key={link.href}>
              {showSection && (
                <div className="text-label-sm text-N-200 uppercase tracking-widest mt-6 mb-1.5 px-3">{link.section}</div>
              )}
              <Link href={link.href}
                className={active ? 'ads-nav-item-active' : 'ads-nav-item'}>
                <Icon size={20} stroke={1.5} /> {link.label}
              </Link>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
