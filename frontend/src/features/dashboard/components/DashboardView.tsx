'use client';

import { useFetch } from '@/lib/hooks';
import type { DashboardSummary } from '@/features/dashboard/types';
import { formatKRWShort, formatKRW } from '@/lib/format';
import KpiCard from '@/components/ui/KpiCard';
import StackedBarChart from '@/components/charts/StackedBarChart';
import styles from './DashboardView.module.css';

export default function DashboardView() {
  const { data, error, isLoading } = useFetch<DashboardSummary>('/dashboard/summary');

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>대시보드 데이터를 불러오는 중...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.error}>
        <span className={styles.errorIcon}>⚠️</span>
        <span>데이터를 불러올 수 없습니다. 백엔드 서버 연결을 확인해주세요.</span>
      </div>
    );
  }

  const chartData = data.departmentContributions.map((d) => ({
    name: d.departmentName,
    매출: d.revenue,
    원가: d.cost,
    공헌이익: d.contribution,
  }));

  return (
    <div className={styles.container}>
      {/* KPI 카드 */}
      <div className={styles.kpiGrid}>
        <KpiCard
          icon="💰"
          label="전사 매출"
          value={formatKRWShort(data.totalRevenue)}
          sub={formatKRW(data.totalRevenue)}
        />
        <KpiCard
          icon="📊"
          label="전사 총원가"
          value={formatKRWShort(data.totalCost)}
          sub={formatKRW(data.totalCost)}
        />
        <KpiCard
          icon="📈"
          label="영업이익률"
          value={`${data.operatingMarginRate}%`}
          trend={data.operatingMarginRate >= 0 ? 'up' : 'down'}
          trendLabel={data.operatingMarginRate >= 15 ? '양호' : data.operatingMarginRate >= 0 ? '개선필요' : '적자'}
        />
        <KpiCard
          icon="⏱️"
          label="평균 가동률"
          value={`${data.averageUtilization}%`}
          trend={data.averageUtilization >= 90 ? 'up' : data.averageUtilization >= 70 ? 'neutral' : 'down'}
          trendLabel={data.averageUtilization >= 90 ? '효율적' : data.averageUtilization >= 70 ? '보통' : '비효율'}
        />
      </div>

      {/* 본부별 공헌이익 차트 */}
      <div className={styles.chartCard}>
        <h2 className={styles.chartTitle}>본부별 공헌이익</h2>
        <StackedBarChart
          data={chartData}
          xKey="name"
          bars={[
            { dataKey: '원가', name: '원가', color: '#EF4444' },
            { dataKey: '공헌이익', name: '공헌이익', color: '#10B981' },
          ]}
          height={320}
        />
      </div>

      {/* 프로젝트 수익성 분포 */}
      <div className={styles.chartCard}>
        <h2 className={styles.chartTitle}>프로젝트 수익성 분포</h2>
        <div className={styles.profitTable}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>프로젝트</th>
                <th>본부</th>
                <th>계약금액</th>
                <th>실제원가</th>
                <th>이익</th>
                <th>이익률</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {data.projectProfitabilities.map((p) => (
                <tr key={p.projectName}>
                  <td className={styles.projName}>{p.projectName}</td>
                  <td>{p.departmentName}</td>
                  <td className={styles.num}>{formatKRWShort(p.contractAmount)}</td>
                  <td className={styles.num}>{formatKRWShort(p.actualCost)}</td>
                  <td className={`${styles.num} ${p.profit >= 0 ? styles.positive : styles.negative}`}>
                    {p.profit >= 0 ? '+' : ''}{formatKRWShort(p.profit)}
                  </td>
                  <td className={`${styles.num} ${p.profitRate >= 0 ? styles.positive : styles.negative}`}>
                    {p.profitRate >= 0 ? '+' : ''}{p.profitRate}%
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      p.profitRate >= 20 ? styles.statusExcellent :
                      p.profitRate >= 0 ? styles.statusOk :
                      styles.statusDanger
                    }`}>
                      {p.profitRate >= 20 ? '우수' : p.profitRate >= 0 ? '정상' : '적자'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
