'use client';

import styles from './KpiCard.module.css';

interface KpiCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
}

export default function KpiCard({ icon, label, value, sub, trend, trendLabel }: KpiCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.value}>{value}</div>
      {(sub || trendLabel) && (
        <div className={styles.bottom}>
          {sub && <span className={styles.sub}>{sub}</span>}
          {trendLabel && (
            <span className={`${styles.trend} ${trend === 'up' ? styles.trendUp : trend === 'down' ? styles.trendDown : ''}`}>
              {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'} {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
