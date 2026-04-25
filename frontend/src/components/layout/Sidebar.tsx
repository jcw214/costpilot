'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { useAuth } from '@/lib/AuthContext';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  // 라우트 변경 시 사이드바 닫기
  useEffect(() => { setOpen(false); }, [pathname]);

  // 로그인 페이지에서는 사이드바 숨김
  if (pathname === '/login' || !user) return null;

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <button
        className={styles.hamburger}
        onClick={() => setOpen(!open)}
        aria-label="메뉴 열기"
      >
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
      </button>

      {/* 모바일 오버레이 */}
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🧭</span>
          <span className={styles.logoText}>CostPilot</span>
        </Link>
        <nav className={styles.nav} role="navigation" aria-label="주 메뉴">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
              aria-current={pathname === item.href ? 'page' : undefined}
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
          <button className={styles.logoutBtn} onClick={signOut} title="로그아웃" aria-label="로그아웃">
            🚪
          </button>
        </div>
      </aside>
    </>
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
