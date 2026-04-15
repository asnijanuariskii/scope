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
    <nav className="w-[280px] bg-white py-7 px-3 flex flex-col sticky top-0 h-screen overflow-y-auto border-r border-outline-variant">
      <div className="flex items-center gap-3 mb-7 px-4">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-on font-bold text-title-md">S</div>
        <div className="text-title-md font-semibold text-on-surface leading-tight">SCO Lead<br/>Management</div>
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
                <div className="text-label-sm text-on-surface-variant uppercase tracking-widest mt-5 mb-2 px-4">{link.section}</div>
              )}
              <Link href={link.href}
                className={active ? 'm3-nav-item-active' : 'm3-nav-item'}>
                <Icon size={24} stroke={1.5} /> {link.label}
              </Link>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
