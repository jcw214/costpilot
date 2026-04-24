'use client';

import styles from './StatusBadge.module.css';

type Status = 'favorable' | 'unfavorable' | 'warning' | 'neutral';

interface StatusBadgeProps {
  status: Status;
  children: React.ReactNode;
}

const ICON_MAP: Record<Status, string> = {
  favorable: '✓',
  unfavorable: '✗',
  warning: '!',
  neutral: '—',
};

export default function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      <span className={styles.icon}>{ICON_MAP[status]}</span>
      {children}
    </span>
  );
}
