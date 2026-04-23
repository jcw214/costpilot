'use client';

import { useEffect, useState } from 'react';
import { getTransferPricing } from '../api';
import type { TransferPricing, PricingMethod, CostDriver } from '../types';
import { formatKRW } from '@/lib/format';
import styles from './TransferView.module.css';

const METHOD_OPTIONS: { key: PricingMethod; label: string; desc: string }[] = [
  { key: 'COST', label: '원가기준', desc: '실제 발생 원가 기준 (×1.0)' },
  { key: 'MARKET', label: '시장가격', desc: '시장 거래 가격 기준 (×1.2)' },
  { key: 'NEGOTIATED', label: '협의가격', desc: '사전 협의 가격 기준 (×0.9)' },
];

const DRIVER_OPTIONS: { key: CostDriver; label: string; desc: string }[] = [
  { key: 'HEADCOUNT', label: '인원수', desc: '본부별 소속 인원수 비율' },
  { key: 'REVENUE', label: '매출액', desc: '본부별 프로젝트 계약금액 비율' },
  { key: 'LABOR_HOURS', label: '투입공수', desc: '본부별 총 투입시간 비율' },
];

export default function TransferView() {
  const [method, setMethod] = useState<PricingMethod>('COST');
  const [driver, setDriver] = useState<CostDriver>('HEADCOUNT');
  const [data, setData] = useState<TransferPricing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTransferPricing(method, driver)
      .then(setData)
      .finally(() => setLoading(false));
  }, [method, driver]);

  return (
    <div className={styles.container}>
      {/* 가격 정책 선택 */}
      <div className={styles.sectionLabel}>💰 가격 정책</div>
      <div className={styles.methodGroup}>
        {METHOD_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            className={`${styles.methodBtn} ${method === opt.key ? styles.methodActive : ''}`}
            onClick={() => setMethod(opt.key)}
          >
            <span className={styles.methodLabel}>{opt.label}</span>
            <span className={styles.methodDesc}>{opt.desc}</span>
          </button>
        ))}
      </div>

      {/* 배부 기준 선택 */}
      <div className={styles.sectionLabel}>📊 배부 기준 (Cost Driver)</div>
      <div className={styles.methodGroup}>
        {DRIVER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            className={`${styles.driverBtn} ${driver === opt.key ? styles.driverActive : ''}`}
            onClick={() => setDriver(opt.key)}
          >
            <span className={styles.methodLabel}>{opt.label}</span>
            <span className={styles.methodDesc}>{opt.desc}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>시뮬레이션 계산 중...</span>
        </div>
      ) : data.length === 0 ? (
        <div className={styles.empty}>배부 대상 데이터가 없습니다.</div>
      ) : (
        <div className={styles.results}>
          {data.map((item) => (
            <div key={item.supportDepartmentName} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardLeft}>
                  <span className={styles.cardIcon}>🏢</span>
                  <div>
                    <div className={styles.cardTitle}>{item.supportDepartmentName}</div>
                    <div className={styles.cardSub}>간접비 합계: {formatKRW(item.totalOverheadCost)}</div>
                  </div>
                </div>
                <div className={styles.badgeGroup}>
                  <div className={styles.pricingBadge}>{item.pricingMethod}</div>
                  <div className={styles.driverBadge}>{item.costDriver}</div>
                </div>
              </div>

              <div className={styles.arrow}>▼ 배부</div>

              <div className={styles.allocGrid}>
                {item.allocations.map((alloc) => (
                  <div key={alloc.revenueDepartmentName} className={styles.allocCard}>
                    <div className={styles.allocHeader}>
                      <span className={styles.allocDept}>{alloc.revenueDepartmentName}</span>
                      <span className={styles.allocRatio}>{alloc.driverRatio}%</span>
                    </div>
                    <span className={styles.allocAmt}>{formatKRW(alloc.allocatedAmount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
