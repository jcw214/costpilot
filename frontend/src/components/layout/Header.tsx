'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { NAV_ITEMS } from '@/lib/constants';
import styles from './Header.module.css';

function getPageTitle(pathname: string): string {
  if (pathname === '/') return '전사 경영 성과 요약';
  const item = NAV_ITEMS.find((n) => n.href === pathname);
  return item?.label ?? '';
}

function getPageIcon(pathname: string): string {
  if (pathname === '/') return '📊';
  const item = NAV_ITEMS.find((n) => n.href === pathname);
  return item?.icon ?? '';
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'ROLE_ADMIN': return '관리자';
    case 'ROLE_DIRECTOR': return '경영진';
    case 'ROLE_PM': return 'PM';
    case 'ROLE_USER': return '사용자';
    default: return role;
  }
}

export default function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  if (pathname === '/login' || !user) return null;

  const title = getPageTitle(pathname);
  const icon = getPageIcon(pathname);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.icon}>{icon}</span>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.right}>
        <div className={styles.user}>
          <span className={styles.avatar}>👤</span>
          <span className={styles.name}>{user.displayName}</span>
          <span className={styles.role}>{getRoleLabel(user.role)}</span>
        </div>
        <div className={styles.divider} />
        <Link href="/settings" className={styles.headerBtn} title="설정" aria-label="설정">
          ⚙️
        </Link>
        <button className={styles.headerBtn} onClick={signOut} title="로그아웃" aria-label="로그아웃">
          🚪
        </button>
      </div>
    </header>
  );
}
