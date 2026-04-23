'use client';

import { useEffect, useState } from 'react';
import { getStandardCost } from '../api';
import type { StandardCostData, CostDriver } from '../types';
import { formatKRW } from '@/lib/format';
import styles from './StandardView.module.css';

type Tab = 'rates' | 'alloc' | 'compare';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'rates', label: '표준원가 기준', icon: '📋' },
  { key: 'alloc', label: '배분 결과', icon: '📊' },
  { key: 'compare', label: '표준 vs 실제', icon: '⚖️' },
];

const DRIVER_OPTIONS: { key: CostDriver; label: string }[] = [
  { key: 'HEADCOUNT', label: '인원수' },
  { key: 'REVENUE', label: '매출액' },
  { key: 'LABOR_HOURS', label: '투입공수' },
];

export default function StandardView() {
  const [tab, setTab] = useState<Tab>('rates');
  const [driver, setDriver] = useState<CostDriver>('HEADCOUNT');
  const [data, setData] = useState<StandardCostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStandardCost(driver).then(setData).finally(() => setLoading(false));
  }, [driver]);

  if (loading) return <div className={styles.loading}><div className={styles.spinner} /><span>로딩 중...</span></div>;
  if (!data) return <div className={styles.empty}>데이터가 없습니다.</div>;

  return (
    <div className={styles.container}>
      {/* 탭 + 배부기준 */}
      <div className={styles.controls}>
        <div className={styles.tabGroup}>
          {TABS.map((t) => (
            <button key={t.key} className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`} onClick={() => setTab(t.key)}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
        {tab === 'alloc' && (
          <div className={styles.driverGroup}>
            {DRIVER_OPTIONS.map((d) => (
              <button key={d.key} className={`${styles.driverBtn} ${driver === d.key ? styles.driverActive : ''}`} onClick={() => setDriver(d.key)}>
                {d.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 표준원가 기준 테이블 */}
      {tab === 'rates' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>프로젝트 유형</th>
                <th>직급</th>
                <th>표준시급</th>
                <th>표준공수(h)</th>
                <th>표준원가</th>
              </tr>
            </thead>
            <tbody>
              {data.standardRates.map((r, i) => (
                <tr key={i}>
                  <td>{r.projectTypeName}</td>
                  <td>{r.jobGradeName}</td>
                  <td className={styles.num}>{formatKRW(r.standardHourlyRate)}</td>
                  <td className={styles.num}>{r.standardHours.toFixed(0)}</td>
                  <td className={styles.num}>{formatKRW(r.standardCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 배분 결과 */}
      {tab === 'alloc' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>프로젝트</th>
                <th>본부</th>
                <th>표준원가</th>
                <th>배분 간접비</th>
                <th>총 표준원가</th>
              </tr>
            </thead>
            <tbody>
              {data.projectAllocations.map((a, i) => (
                <tr key={i}>
                  <td>{a.projectName}</td>
                  <td>{a.departmentName}</td>
                  <td className={styles.num}>{formatKRW(a.standardCost)}</td>
                  <td className={styles.num}>{formatKRW(a.allocatedOverhead)}</td>
                  <td className={`${styles.num} ${styles.bold}`}>{formatKRW(a.totalStandardCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 표준 vs 실제 비교 */}
      {tab === 'compare' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>프로젝트</th>
                <th>본부</th>
                <th>표준원가</th>
                <th>실제원가</th>
                <th>차이</th>
                <th>차이율</th>
                <th>판정</th>
              </tr>
            </thead>
            <tbody>
              {data.comparisons.map((c, i) => (
                <tr key={i}>
                  <td>{c.projectName}</td>
                  <td>{c.departmentName}</td>
                  <td className={styles.num}>{formatKRW(c.standardCost)}</td>
                  <td className={styles.num}>{formatKRW(c.actualCost)}</td>
                  <td className={`${styles.num} ${c.verdict === 'U' ? styles.unfavorable : styles.favorable}`}>
                    {c.variance > 0 ? '+' : ''}{formatKRW(c.variance)}
                  </td>
                  <td className={`${styles.num} ${c.verdict === 'U' ? styles.unfavorable : styles.favorable}`}>
                    {c.varianceRate > 0 ? '+' : ''}{c.varianceRate}%
                  </td>
                  <td>
                    <span className={`${styles.verdict} ${c.verdict === 'U' ? styles.verdictU : styles.verdictF}`}>
                      {c.verdict === 'U' ? '불리(U)' : '유리(F)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
