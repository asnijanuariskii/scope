import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'SCO Lead Management',
  description: 'Sistem manajemen lead untuk SCO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-n-100 text-n-800 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
