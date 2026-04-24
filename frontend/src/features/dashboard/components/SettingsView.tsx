'use client';

import { useFetch } from '@/lib/hooks';
import type { StandardCostRateSetting } from '@/features/dashboard/types';
import { formatKRW } from '@/lib/format';
import styles from './SettingsView.module.css';

export default function SettingsView() {
  const { data, error, isLoading } = useFetch<StandardCostRateSetting[]>('/standard-cost-rates');

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>표준원가 기준 데이터를 불러오는 중...</span>
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

  // 프로젝트 유형별 그룹핑
  const grouped = data.reduce<Record<string, StandardCostRateSetting[]>>((acc, item) => {
    if (!acc[item.projectTypeName]) acc[item.projectTypeName] = [];
    acc[item.projectTypeName].push(item);
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <div className={styles.infoCard}>
        <span className={styles.infoIcon}>ℹ️</span>
        <div>
          <div className={styles.infoTitle}>표준원가 기준표</div>
          <div className={styles.infoDesc}>
            프로젝트 유형 × 직급별 표준시급과 표준공수를 기반으로 산출된 표준원가입니다.
            직급별 표준시급은 <strong>기준 데이터 → 직급</strong> 메뉴에서 수정할 수 있습니다.
          </div>
        </div>
      </div>

      {Object.entries(grouped).map(([typeName, rates]) => {
        const totalStdCost = rates.reduce((sum, r) => sum + r.standardCost, 0);
        const totalHours = rates.reduce((sum, r) => sum + r.standardHours, 0);

        return (
          <div key={typeName} className={styles.groupCard}>
            <div className={styles.groupHeader}>
              <div className={styles.groupTitle}>
                <span className={styles.groupIcon}>📋</span>
                {typeName}
              </div>
              <div className={styles.groupMeta}>
                <span>총 표준원가: <strong>{formatKRW(totalStdCost)}</strong></span>
                <span>총 표준공수: <strong>{totalHours.toFixed(0)}h</strong></span>
              </div>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>직급</th>
                  <th>표준시급</th>
                  <th>표준공수(h)</th>
                  <th>표준원가</th>
                  <th>비중</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r) => (
                  <tr key={r.id}>
                    <td className={styles.gradeCell}>
                      <span className={styles.gradeBadge}>{r.jobGradeName}</span>
                    </td>
                    <td className={styles.num}>{formatKRW(r.standardHourlyRate)}</td>
                    <td className={styles.num}>{r.standardHours.toFixed(0)}</td>
                    <td className={`${styles.num} ${styles.bold}`}>{formatKRW(r.standardCost)}</td>
                    <td>
                      <div className={styles.shareBar}>
                        <div
                          className={styles.shareFill}
                          style={{ width: `${totalStdCost > 0 ? (r.standardCost / totalStdCost) * 100 : 0}%` }}
                        />
                        <span className={styles.shareLabel}>
                          {totalStdCost > 0 ? ((r.standardCost / totalStdCost) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
