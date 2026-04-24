'use client';

import { useState } from 'react';
import { useFetch } from '@/lib/hooks';
import type { PerformanceData } from '@/features/dashboard/types';
import { formatKRWShort, formatKRW } from '@/lib/format';
import StackedBarChart from '@/components/charts/StackedBarChart';
import styles from './PerformanceView.module.css';

type Tab = 'department' | 'project' | 'employee';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'department', label: '본부별 성과', icon: '🏢' },
  { key: 'project', label: '프로젝트 수익성', icon: '📁' },
  { key: 'employee', label: '인력 가동률', icon: '👤' },
];

export default function PerformanceView() {
  const [tab, setTab] = useState<Tab>('department');
  const { data, error, isLoading } = useFetch<PerformanceData>('/dashboard/performance');

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>성과 분석 중...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.error}>
        <span>⚠️</span>
        <span>데이터를 불러올 수 없습니다.</span>
      </div>
    );
  }

  const deptChartData = data.departmentPerformances.map((d) => ({
    name: d.departmentName,
    매출: d.revenue,
    원가: d.cost,
    이익: d.profit,
  }));

  return (
    <div className={styles.container}>
      {/* 탭 */}
      <div className={styles.tabGroup}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* 본부별 성과 */}
      {tab === 'department' && (
        <div className={styles.section}>
          <div className={styles.chartCard}>
            <h3 className={styles.sectionTitle}>본부별 매출/원가/이익 비교</h3>
            <StackedBarChart
              data={deptChartData}
              xKey="name"
              bars={[
                { dataKey: '원가', name: '원가', color: '#EF4444' },
                { dataKey: '이익', name: '이익', color: '#10B981' },
              ]}
              height={300}
            />
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>본부</th>
                  <th>매출</th>
                  <th>원가</th>
                  <th>이익</th>
                  <th>이익률</th>
                  <th>인원</th>
                  <th>가동률</th>
                </tr>
              </thead>
              <tbody>
                {data.departmentPerformances.map((d) => (
                  <tr key={d.departmentName}>
                    <td className={styles.nameCell}>{d.departmentName}</td>
                    <td className={styles.num}>{formatKRWShort(d.revenue)}</td>
                    <td className={styles.num}>{formatKRWShort(d.cost)}</td>
                    <td className={`${styles.num} ${d.profit >= 0 ? styles.positive : styles.negative}`}>
                      {d.profit >= 0 ? '+' : ''}{formatKRWShort(d.profit)}
                    </td>
                    <td className={`${styles.num} ${d.profitRate >= 0 ? styles.positive : styles.negative}`}>
                      {d.profitRate}%
                    </td>
                    <td className={styles.num}>{d.employeeCount}명</td>
                    <td>
                      <div className={styles.utilBar}>
                        <div
                          className={`${styles.utilFill} ${
                            d.avgUtilization >= 100 ? styles.utilOver :
                            d.avgUtilization >= 80 ? styles.utilGood :
                            styles.utilLow
                          }`}
                          style={{ width: `${Math.min(d.avgUtilization, 120) / 1.2}%` }}
                        />
                        <span className={styles.utilLabel}>{d.avgUtilization}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 프로젝트 수익성 */}
      {tab === 'project' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>프로젝트</th>
                <th>본부</th>
                <th>계약금액</th>
                <th>인건비</th>
                <th>직접비</th>
                <th>총원가</th>
                <th>이익</th>
                <th>이익률</th>
                <th>투입시간</th>
              </tr>
            </thead>
            <tbody>
              {data.projectPerformances.map((p) => (
                <tr key={p.projectName}>
                  <td className={styles.nameCell}>{p.projectName}</td>
                  <td>{p.departmentName}</td>
                  <td className={styles.num}>{formatKRWShort(p.contractAmount)}</td>
                  <td className={styles.num}>{formatKRWShort(p.laborCost)}</td>
                  <td className={styles.num}>{formatKRWShort(p.directExpense)}</td>
                  <td className={styles.num}>{formatKRWShort(p.totalCost)}</td>
                  <td className={`${styles.num} ${p.profit >= 0 ? styles.positive : styles.negative}`}>
                    {p.profit >= 0 ? '+' : ''}{formatKRWShort(p.profit)}
                  </td>
                  <td className={`${styles.num} ${p.profitRate >= 0 ? styles.positive : styles.negative}`}>
                    {p.profitRate}%
                  </td>
                  <td className={styles.num}>{p.totalHours.toFixed(0)}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 인력 가동률 */}
      {tab === 'employee' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>직원명</th>
                <th>본부</th>
                <th>직급</th>
                <th>투입시간</th>
                <th>표준시간</th>
                <th style={{ width: '30%' }}>가동률</th>
              </tr>
            </thead>
            <tbody>
              {data.employeeUtilizations.map((e) => (
                <tr key={e.employeeName}>
                  <td className={styles.nameCell}>{e.employeeName}</td>
                  <td>{e.departmentName}</td>
                  <td>{e.jobGradeName}</td>
                  <td className={styles.num}>{e.totalHours}h</td>
                  <td className={styles.num}>{e.standardHours}h</td>
                  <td>
                    <div className={styles.utilBar}>
                      <div
                        className={`${styles.utilFill} ${
                          e.utilizationRate >= 100 ? styles.utilOver :
                          e.utilizationRate >= 80 ? styles.utilGood :
                          styles.utilLow
                        }`}
                        style={{ width: `${Math.min(e.utilizationRate, 150) / 1.5}%` }}
                      />
                      <span className={styles.utilLabel}>{e.utilizationRate}%</span>
                    </div>
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
