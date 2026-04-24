'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/AuthContext';
import AuthGuard from '@/components/layout/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  return (
    <AuthProvider>
      <AuthGuard>
        {isLogin ? (
          children
        ) : (
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">{children}</main>
          </div>
        )}
      </AuthGuard>
    </AuthProvider>
  );
}
