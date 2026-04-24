'use client';

import { useEffect, useState } from 'react';
import { getStandardCost } from '../api';
import type { StandardCostData, StandardRate, ProjectComparison, CostDriver } from '../types';
import { formatKRW } from '@/lib/format';
import { gradeOrder } from '@/lib/constants';
import SortableTable, { type Column } from '@/components/ui/SortableTable';
import styles from './StandardView.module.css';

type Tab = 'rates' | 'compare';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'rates', label: '표준원가 기준', icon: '📋' },
  { key: 'compare', label: '표준 vs 실제', icon: '⚖️' },
];

const RATE_COLS: Column<StandardRate>[] = [
  { key: 'type', label: '프로젝트 유형', render: (r) => r.projectTypeName, sortValue: (r) => r.projectTypeName },
  { key: 'grade', label: '직급', render: (r) => r.jobGradeName, sortValue: (r) => gradeOrder(r.jobGradeName) },
  { key: 'hourlyRate', label: '표준시급', align: 'right', render: (r) => formatKRW(r.standardHourlyRate), sortValue: (r) => r.standardHourlyRate },
  { key: 'hours', label: '표준공수(h)', align: 'right', render: (r) => r.standardHours.toFixed(0), sortValue: (r) => r.standardHours },
  { key: 'cost', label: '표준원가', align: 'right', render: (r) => formatKRW(r.standardCost), sortValue: (r) => r.standardCost },
];

const COMPARE_COLS: Column<ProjectComparison>[] = [
  { key: 'project', label: '프로젝트', render: (c) => c.projectName, sortValue: (c) => c.projectName },
  { key: 'dept', label: '본부', render: (c) => c.departmentName, sortValue: (c) => c.departmentName },
  { key: 'std', label: '표준원가', align: 'right', render: (c) => formatKRW(c.standardCost), sortValue: (c) => c.standardCost },
  { key: 'actual', label: '실제원가', align: 'right', render: (c) => formatKRW(c.actualCost), sortValue: (c) => c.actualCost },
  {
    key: 'variance', label: '차이', align: 'right',
    render: (c) => <span className={c.verdict === 'U' ? styles.unfavorable : styles.favorable}>{c.variance > 0 ? '+' : ''}{formatKRW(c.variance)}</span>,
    sortValue: (c) => c.variance,
  },
  {
    key: 'varianceRate', label: '차이율', align: 'right',
    render: (c) => <span className={c.verdict === 'U' ? styles.unfavorable : styles.favorable}>{c.varianceRate > 0 ? '+' : ''}{c.varianceRate}%</span>,
    sortValue: (c) => c.varianceRate,
  },
  {
    key: 'verdict', label: '판정',
    render: (c) => <span className={`${styles.verdict} ${c.verdict === 'U' ? styles.verdictU : styles.verdictF}`}>{c.verdict === 'U' ? '불리(U)' : '유리(F)'}</span>,
    sortValue: (c) => c.verdict,
  },
];

export default function StandardView() {
  const [tab, setTab] = useState<Tab>('rates');
  const [data, setData] = useState<StandardCostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStandardCost('HEADCOUNT' as CostDriver).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}><div className={styles.spinner} /><span>로딩 중...</span></div>;
  if (!data) return <div className={styles.empty}>데이터가 없습니다.</div>;

  return (
    <div className={styles.container}>
      {/* 탭 */}
      <div className={styles.controls}>
        <div className={styles.tabGroup}>
          {TABS.map((t) => (
            <button key={t.key} className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`} onClick={() => setTab(t.key)}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 표준원가 기준 테이블 */}
      {tab === 'rates' && (
        <div className={styles.tableWrap}>
          <SortableTable columns={RATE_COLS} data={data.standardRates} rowKey={(_, i) => i} />
        </div>
      )}

      {/* 표준 vs 실제 비교 */}
      {tab === 'compare' && (
        <div className={styles.tableWrap}>
          <SortableTable columns={COMPARE_COLS} data={data.comparisons} rowKey={(_, i) => i} />
        </div>
      )}
    </div>
  );
}
