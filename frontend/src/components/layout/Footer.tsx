'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import styles from './Footer.module.css';

export default function Footer() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (pathname === '/login' || !user) return null;

  return (
    <footer className={styles.footer}>
      <span>© 2026 CostPilot</span>
      <span className={styles.dot}>·</span>
      <span>원가/관리회계 통합관리 시스템</span>
    </footer>
  );
}
