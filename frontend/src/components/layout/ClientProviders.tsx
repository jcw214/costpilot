'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/AuthContext';
import AuthGuard from '@/components/layout/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HelpPanel from '@/components/ui/HelpPanel';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  return (
    <AuthProvider>
      <AuthGuard>
        {isLogin ? (
          children
        ) : (
          <>
            <Header />
            <div className="app-layout">
              <Sidebar />
              <main className="main-content">{children}</main>
              <HelpPanel />
            </div>
            <Footer />
          </>
        )}
      </AuthGuard>
    </AuthProvider>
  );
}
