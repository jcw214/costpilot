'use client';

import { useEffect, useState } from 'react';
import { getVarianceAnalysis } from '../api';
import type { VarianceAnalysisData, LaborVariance, BudgetConsumption, VarianceSummary } from '../types';
import { formatKRW } from '@/lib/format';
import SortableTable, { type Column } from '@/components/ui/SortableTable';
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

const LABOR_COLS: Column<LaborVariance>[] = [
  { key: 'project', label: '프로젝트', render: (lv) => lv.projectName, sortValue: (lv) => lv.projectName },
  { key: 'dept', label: '본부', render: (lv) => lv.departmentName, sortValue: (lv) => lv.departmentName },
  { key: 'std', label: '표준노무비', align: 'right', render: (lv) => formatKRW(lv.standardLaborCost), sortValue: (lv) => lv.standardLaborCost },
  { key: 'actual', label: '실제노무비', align: 'right', render: (lv) => formatKRW(lv.actualLaborCost), sortValue: (lv) => lv.actualLaborCost },
  { key: 'rate', label: '임률차이', align: 'right', render: (lv) => <Verdict value={lv.rateVariance} verdict={lv.rateVerdict} />, sortValue: (lv) => lv.rateVariance },
  { key: 'eff', label: '능률차이', align: 'right', render: (lv) => <Verdict value={lv.efficiencyVariance} verdict={lv.efficiencyVerdict} />, sortValue: (lv) => lv.efficiencyVariance },
  { key: 'total', label: '총차이', align: 'right', render: (lv) => <strong><Verdict value={lv.totalVariance} verdict={lv.totalVerdict} /></strong>, sortValue: (lv) => lv.totalVariance },
  { key: 'verdict', label: '판정', render: (lv) => <VerdictBadge verdict={lv.totalVerdict} />, sortValue: (lv) => lv.totalVerdict },
];

const BUDGET_COLS: Column<BudgetConsumption>[] = [
  { key: 'project', label: '프로젝트', render: (bc) => bc.projectName, sortValue: (bc) => bc.projectName },
  { key: 'dept', label: '본부', render: (bc) => bc.departmentName, sortValue: (bc) => bc.departmentName },
  { key: 'budget', label: '예산', align: 'right', render: (bc) => formatKRW(bc.budgetAmount), sortValue: (bc) => bc.budgetAmount },
  { key: 'spent', label: '집행액', align: 'right', render: (bc) => formatKRW(bc.actualSpent), sortValue: (bc) => bc.actualSpent },
  { key: 'rate', label: '소진율', align: 'right', render: (bc) => `${bc.consumptionRate}%`, sortValue: (bc) => bc.consumptionRate },
  {
    key: 'gauge', label: '게이지', width: '30%',
    render: (bc) => (
      <div className={styles.gauge}>
        <div
          className={`${styles.gaugeBar} ${bc.status === '초과' ? styles.gaugeOver : bc.status === '주의' ? styles.gaugeWarn : styles.gaugeOk}`}
          style={{ width: `${Math.min(bc.consumptionRate, 120)}%` }}
        />
      </div>
    ),
    sortValue: (bc) => bc.consumptionRate,
  },
  { key: 'status', label: '상태', render: (bc) => <StatusBadge status={bc.status} />, sortValue: (bc) => bc.status },
];

const SUMMARY_COLS: Column<VarianceSummary>[] = [
  { key: 'project', label: '프로젝트', render: (s) => s.projectName, sortValue: (s) => s.projectName },
  { key: 'dept', label: '본부', render: (s) => s.departmentName, sortValue: (s) => s.departmentName },
  { key: 'rate', label: '임률 요인', align: 'right', render: (s) => <Verdict value={s.rateVariance} verdict={s.rateVariance > 0 ? 'U' : 'F'} />, sortValue: (s) => s.rateVariance },
  { key: 'eff', label: '능률 요인', align: 'right', render: (s) => <Verdict value={s.efficiencyVariance} verdict={s.efficiencyVariance > 0 ? 'U' : 'F'} />, sortValue: (s) => s.efficiencyVariance },
  { key: 'total', label: '총차이', align: 'right', render: (s) => <strong><Verdict value={s.totalVariance} verdict={s.verdict} /></strong>, sortValue: (s) => s.totalVariance },
  { key: 'verdict', label: '판정', render: (s) => <VerdictBadge verdict={s.verdict} />, sortValue: (s) => s.verdict },
];

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
          <SortableTable columns={LABOR_COLS} data={data.laborVariances} rowKey={(_, i) => i} />
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
          <SortableTable columns={BUDGET_COLS} data={data.budgetConsumptions} rowKey={(_, i) => i} />
        </div>
      )}

      {/* 종합 요약 */}
      {tab === 'summary' && (
        <div className={styles.tableWrap}>
          <SortableTable columns={SUMMARY_COLS} data={data.summaries} rowKey={(_, i) => i} />
        </div>
      )}
    </div>
  );
}
