import QueryProvider from '@/lib/providers/query-provider';
import type { Metadata } from 'next';
import AppShell from './components/AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Application Tracker',
  description: 'Track job applications, files, and tools',
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}