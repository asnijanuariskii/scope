import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="tds-layout">
      <Sidebar />
      <div className="tds-layout__main">
        <Header />
        <main className="tds-layout__content">{children}</main>
      </div>
    </div>
  );
}
