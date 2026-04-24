'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, hasAccess } from '@/lib/constants';
import { useAuth } from '@/lib/AuthContext';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  // 로그인 페이지에서는 사이드바 숨김
  if (pathname === '/login' || !user) return null;

  const visibleItems = NAV_ITEMS.filter((item) => hasAccess(user.role, item.minRole));

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🧭</span>
        <span className={styles.logoText}>CostPilot</span>
      </div>
      <nav className={styles.nav}>
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <span className={styles.userAvatar}>👤</span>
          <div className={styles.userMeta}>
            <span className={styles.userName}>{user.displayName}</span>
            <span className={styles.userRole}>{getRoleLabel(user.role)}</span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={signOut} title="로그아웃">
          🚪
        </button>
      </div>
    </aside>
  );
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
