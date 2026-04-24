'use client';

import { useState } from 'react';
import { useFetch } from '@/lib/hooks';
import type { PerformanceData, DepartmentPerformance, ProjectPerformance, EmployeeUtilization } from '@/features/dashboard/types';
import { formatKRWShort } from '@/lib/format';
import StackedBarChart from '@/components/charts/StackedBarChart';
import SortableTable, { type Column } from '@/components/ui/SortableTable';
import styles from './PerformanceView.module.css';

type Tab = 'department' | 'project' | 'employee';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'department', label: '본부별 성과', icon: '🏢' },
  { key: 'project', label: '프로젝트 수익성', icon: '📁' },
  { key: 'employee', label: '인력 가동률', icon: '👤' },
];

const DEPT_COLS: Column<DepartmentPerformance>[] = [
  { key: 'name', label: '본부', render: (d) => <span className={styles.nameCell}>{d.departmentName}</span>, sortValue: (d) => d.departmentName },
  { key: 'revenue', label: '매출', align: 'right', render: (d) => formatKRWShort(d.revenue), sortValue: (d) => d.revenue },
  { key: 'cost', label: '원가', align: 'right', render: (d) => formatKRWShort(d.cost), sortValue: (d) => d.cost },
  { key: 'profit', label: '이익', align: 'right', render: (d) => <span className={d.profit >= 0 ? styles.positive : styles.negative}>{d.profit >= 0 ? '+' : ''}{formatKRWShort(d.profit)}</span>, sortValue: (d) => d.profit },
  { key: 'profitRate', label: '이익률', align: 'right', render: (d) => <span className={d.profitRate >= 0 ? styles.positive : styles.negative}>{d.profitRate}%</span>, sortValue: (d) => d.profitRate },
  { key: 'count', label: '인원', align: 'right', render: (d) => `${d.employeeCount}명`, sortValue: (d) => d.employeeCount },
  {
    key: 'util', label: '가동률', width: '25%',
    render: (d) => (
      <div className={styles.utilBar}>
        <div
          className={`${styles.utilFill} ${d.avgUtilization >= 100 ? styles.utilOver : d.avgUtilization >= 80 ? styles.utilGood : styles.utilLow}`}
          style={{ width: `${Math.min(d.avgUtilization, 120) / 1.2}%` }}
        />
        <span className={styles.utilLabel}>{d.avgUtilization}%</span>
      </div>
    ),
    sortValue: (d) => d.avgUtilization,
  },
];

const PROJ_COLS: Column<ProjectPerformance>[] = [
  { key: 'name', label: '프로젝트', render: (p) => <span className={styles.nameCell}>{p.projectName}</span>, sortValue: (p) => p.projectName },
  { key: 'dept', label: '본부', render: (p) => p.departmentName, sortValue: (p) => p.departmentName },
  { key: 'contract', label: '계약금액', align: 'right', render: (p) => formatKRWShort(p.contractAmount), sortValue: (p) => p.contractAmount },
  { key: 'labor', label: '인건비', align: 'right', render: (p) => formatKRWShort(p.laborCost), sortValue: (p) => p.laborCost },
  { key: 'direct', label: '직접비', align: 'right', render: (p) => formatKRWShort(p.directExpense), sortValue: (p) => p.directExpense },
  { key: 'total', label: '총원가', align: 'right', render: (p) => formatKRWShort(p.totalCost), sortValue: (p) => p.totalCost },
  { key: 'profit', label: '이익', align: 'right', render: (p) => <span className={p.profit >= 0 ? styles.positive : styles.negative}>{p.profit >= 0 ? '+' : ''}{formatKRWShort(p.profit)}</span>, sortValue: (p) => p.profit },
  { key: 'profitRate', label: '이익률', align: 'right', render: (p) => <span className={p.profitRate >= 0 ? styles.positive : styles.negative}>{p.profitRate}%</span>, sortValue: (p) => p.profitRate },
  { key: 'hours', label: '투입시간', align: 'right', render: (p) => `${p.totalHours.toFixed(0)}h`, sortValue: (p) => p.totalHours },
];

const EMP_COLS: Column<EmployeeUtilization>[] = [
  { key: 'name', label: '직원명', render: (e) => <span className={styles.nameCell}>{e.employeeName}</span>, sortValue: (e) => e.employeeName },
  { key: 'dept', label: '본부', render: (e) => e.departmentName, sortValue: (e) => e.departmentName },
  { key: 'grade', label: '직급', render: (e) => e.jobGradeName, sortValue: (e) => e.jobGradeName },
  { key: 'hours', label: '투입시간', align: 'right', render: (e) => `${e.totalHours}h`, sortValue: (e) => e.totalHours },
  { key: 'stdHours', label: '표준시간', align: 'right', render: (e) => `${e.standardHours}h`, sortValue: (e) => e.standardHours },
  {
    key: 'util', label: '가동률', width: '30%',
    render: (e) => (
      <div className={styles.utilBar}>
        <div
          className={`${styles.utilFill} ${e.utilizationRate >= 100 ? styles.utilOver : e.utilizationRate >= 80 ? styles.utilGood : styles.utilLow}`}
          style={{ width: `${Math.min(e.utilizationRate, 150) / 1.5}%` }}
        />
        <span className={styles.utilLabel}>{e.utilizationRate}%</span>
      </div>
    ),
    sortValue: (e) => e.utilizationRate,
  },
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
            <SortableTable
              columns={DEPT_COLS}
              data={data.departmentPerformances}
              rowKey={(d) => d.departmentName}
            />
          </div>
        </div>
      )}

      {/* 프로젝트 수익성 */}
      {tab === 'project' && (
        <div className={styles.tableWrap}>
          <SortableTable
            columns={PROJ_COLS}
            data={data.projectPerformances}
            rowKey={(p) => p.projectName}
          />
        </div>
      )}

      {/* 인력 가동률 */}
      {tab === 'employee' && (
        <div className={styles.tableWrap}>
          <SortableTable
            columns={EMP_COLS}
            data={data.employeeUtilizations}
            rowKey={(e) => e.employeeName}
          />
        </div>
      )}
    </div>
  );
}
