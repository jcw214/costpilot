'use client';

import { useEffect, useState } from 'react';
import { getVarianceAnalysis } from '../api';
import type { VarianceAnalysisData } from '../types';
import { formatKRW } from '@/lib/format';
import styles from './VarianceView.module.css';

type Tab = 'labor' | 'overhead' | 'budget' | 'summary';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'labor', label: '직접노무비 차이', icon: '👷' },
  { key: 'overhead', label: '간접원가 차이', icon: '🏭' },
  { key: 'budget', label: '예산 소진율', icon: '💳' },
  { key: 'summary', label: '종합 요약', icon: '📈' },
];

function Verdict({ value, verdict }: { value: number; verdict: string }) {
  const cls = verdict === 'U' ? styles.unfavorable : styles.favorable;
  return <span className={cls}>{value > 0 ? '+' : ''}{formatKRW(value)}</span>;
}

function VerdictBadge({ verdict }: { verdict: string }) {
  return (
    <span className={`${styles.verdict} ${verdict === 'U' ? styles.verdictU : styles.verdictF}`}>
      {verdict === 'U' ? '불리(U)' : '유리(F)'}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === '초과' ? styles.statusOver : status === '주의' ? styles.statusWarn : styles.statusOk;
  return <span className={`${styles.statusBadge} ${cls}`}>{status}</span>;
}

export default function VarianceView() {
  const [tab, setTab] = useState<Tab>('labor');
  const [data, setData] = useState<VarianceAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getVarianceAnalysis().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}><div className={styles.spinner} /><span>분석 중...</span></div>;
  if (!data) return <div className={styles.empty}>데이터가 없습니다.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.tabGroup}>
        {TABS.map((t) => (
          <button key={t.key} className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`} onClick={() => setTab(t.key)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* 직접노무비 차이 분석 */}
      {tab === 'labor' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>프로젝트</th>
                <th>본부</th>
                <th>표준노무비</th>
                <th>실제노무비</th>
                <th>임률차이</th>
                <th>능률차이</th>
                <th>총차이</th>
                <th>판정</th>
              </tr>
            </thead>
            <tbody>
              {data.laborVariances.map((lv, i) => (
                <tr key={i}>
                  <td>{lv.projectName}</td>
                  <td>{lv.departmentName}</td>
                  <td className={styles.num}>{formatKRW(lv.standardLaborCost)}</td>
                  <td className={styles.num}>{formatKRW(lv.actualLaborCost)}</td>
                  <td className={styles.num}><Verdict value={lv.rateVariance} verdict={lv.rateVerdict} /></td>
                  <td className={styles.num}><Verdict value={lv.efficiencyVariance} verdict={lv.efficiencyVerdict} /></td>
                  <td className={`${styles.num} ${styles.bold}`}><Verdict value={lv.totalVariance} verdict={lv.totalVerdict} /></td>
                  <td><VerdictBadge verdict={lv.totalVerdict} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 간접원가 차이 분석 (3분법) */}
      {tab === 'overhead' && (
        <div className={styles.ohGrid}>
          <div className={styles.ohCard}>
            <div className={styles.ohLabel}>실제 간접원가</div>
            <div className={styles.ohValue}>{formatKRW(data.overheadVariance.actualOverhead)}</div>
          </div>
          <div className={styles.ohCard}>
            <div className={styles.ohLabel}>변동예산 허용액</div>
            <div className={styles.ohValue}>{formatKRW(data.overheadVariance.budgetedOverhead)}</div>
          </div>
          <div className={styles.ohDivider}>▼ 차이 분해 (3분법)</div>
          <div className={styles.ohCard}>
            <div className={styles.ohLabel}>① 예산차이 (Spending)</div>
            <div className={styles.ohValue}><Verdict value={data.overheadVariance.spendingVariance} verdict={data.overheadVariance.spendingVerdict} /></div>
            <VerdictBadge verdict={data.overheadVariance.spendingVerdict} />
          </div>
          <div className={styles.ohCard}>
            <div className={styles.ohLabel}>② 능률차이 (Efficiency)</div>
            <div className={styles.ohValue}><Verdict value={data.overheadVariance.efficiencyVariance} verdict={data.overheadVariance.efficiencyVerdict} /></div>
            <VerdictBadge verdict={data.overheadVariance.efficiencyVerdict} />
          </div>
          <div className={styles.ohCard}>
            <div className={styles.ohLabel}>③ 조업도차이 (Volume)</div>
            <div className={styles.ohValue}><Verdict value={data.overheadVariance.volumeVariance} verdict={data.overheadVariance.volumeVerdict} /></div>
            <VerdictBadge verdict={data.overheadVariance.volumeVerdict} />
          </div>
          <div className={`${styles.ohCard} ${styles.ohTotal}`}>
            <div className={styles.ohLabel}>총 간접원가 차이</div>
            <div className={styles.ohValue}><Verdict value={data.overheadVariance.totalVariance} verdict={data.overheadVariance.totalVerdict} /></div>
            <VerdictBadge verdict={data.overheadVariance.totalVerdict} />
          </div>
        </div>
      )}

      {/* 예산 소진율 */}
      {tab === 'budget' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>프로젝트</th>
                <th>본부</th>
                <th>예산</th>
                <th>집행액</th>
                <th>소진율</th>
                <th style={{ width: '35%' }}>게이지</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {data.budgetConsumptions.map((bc, i) => (
                <tr key={i}>
                  <td>{bc.projectName}</td>
                  <td>{bc.departmentName}</td>
                  <td className={styles.num}>{formatKRW(bc.budgetAmount)}</td>
                  <td className={styles.num}>{formatKRW(bc.actualSpent)}</td>
                  <td className={styles.num}>{bc.consumptionRate}%</td>
                  <td>
                    <div className={styles.gauge}>
                      <div
                        className={`${styles.gaugeBar} ${bc.status === '초과' ? styles.gaugeOver : bc.status === '주의' ? styles.gaugeWarn : styles.gaugeOk}`}
                        style={{ width: `${Math.min(bc.consumptionRate, 120)}%` }}
                      />
                    </div>
                  </td>
                  <td><StatusBadge status={bc.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 종합 요약 */}
      {tab === 'summary' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>프로젝트</th>
                <th>본부</th>
                <th>임률 요인</th>
                <th>능률 요인</th>
                <th>총차이</th>
                <th>판정</th>
              </tr>
            </thead>
            <tbody>
              {data.summaries.map((s, i) => (
                <tr key={i}>
                  <td>{s.projectName}</td>
                  <td>{s.departmentName}</td>
                  <td className={styles.num}><Verdict value={s.rateVariance} verdict={s.rateVariance > 0 ? 'U' : 'F'} /></td>
                  <td className={styles.num}><Verdict value={s.efficiencyVariance} verdict={s.efficiencyVariance > 0 ? 'U' : 'F'} /></td>
                  <td className={`${styles.num} ${styles.bold}`}><Verdict value={s.totalVariance} verdict={s.verdict} /></td>
                  <td><VerdictBadge verdict={s.verdict} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
