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
    <nav className="w-[240px] bg-white rounded-2xl shadow-card m-4 p-6 flex flex-col sticky top-4 h-[calc(100vh-32px)] overflow-y-auto">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
        <div className="font-bold text-sm leading-tight">SCO Lead<br/>Management</div>
      </div>

      {links.map((link) => {
        if (!user || !link.roles.includes(user.role)) return null;
        const active = pathname.startsWith(link.href);
        const showSection = link.section && link.section !== lastSection;
        if (link.section) lastSection = link.section;
        const Icon = link.icon;

        return (
          <div key={link.href}>
            {showSection && <div className="text-[10px] font-bold text-n-400 uppercase tracking-widest mt-4 mb-2 px-3">{link.section}</div>}
            <Link href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5 ${active ? 'bg-brand-light text-brand font-semibold' : 'text-n-600 hover:bg-n-100 hover:text-n-800'}`}>
              <Icon size={20} stroke={1.5} /> {link.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
