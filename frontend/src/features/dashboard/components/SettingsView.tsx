'use client';

import { useState } from 'react';
import { useFetch } from '@/lib/hooks';
import { getAuthToken } from '@/lib/auth';
import type {
  StandardCostRateSetting,
  PricingMethodSetting,
  CostDriverSetting,
} from '@/features/dashboard/types';
import { formatKRW } from '@/lib/format';
import styles from './SettingsView.module.css';

type SettingsTab = 'standard' | 'pricing' | 'driver';

const TABS: { key: SettingsTab; label: string; icon: string }[] = [
  { key: 'standard', label: '표준원가 기준', icon: '📐' },
  { key: 'pricing', label: '내부대체 가격 정책', icon: '💲' },
  { key: 'driver', label: '간접비 배부 기준', icon: '🔀' },
];

export default function SettingsView() {
  const [tab, setTab] = useState<SettingsTab>('standard');

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

      {tab === 'standard' && <StandardCostPanel />}
      {tab === 'pricing' && <PricingMethodPanel />}
      {tab === 'driver' && <CostDriverPanel />}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   표준원가 기준 패널 (기존)
   ────────────────────────────────────────────────────────── */
function StandardCostPanel() {
  const { data, error, isLoading } = useFetch<StandardCostRateSetting[]>('/standard-cost-rates');

  if (isLoading) return <LoadingState text="표준원가 기준 데이터를 불러오는 중..." />;
  if (error || !data) return <ErrorState />;

  const grouped = data.reduce<Record<string, StandardCostRateSetting[]>>((acc, item) => {
    if (!acc[item.projectTypeName]) acc[item.projectTypeName] = [];
    acc[item.projectTypeName].push(item);
    return acc;
  }, {});

  return (
    <div className={styles.panelContent}>
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

/* ──────────────────────────────────────────────────────────
   가격 정책 관리 패널
   ────────────────────────────────────────────────────────── */
function PricingMethodPanel() {
  const { data, error, isLoading, mutate } = useFetch<PricingMethodSetting[]>('/settings/pricing-methods');
  const [editId, setEditId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<PricingMethodSetting>>({});
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<{ id: number; values: Partial<PricingMethodSetting> } | null>(null);

  if (isLoading) return <LoadingState text="가격 정책 데이터를 불러오는 중..." />;
  if (error || !data) return <ErrorState />;

  const startEdit = (item: PricingMethodSetting) => {
    setEditId(item.id);
    setEditValues({ displayName: item.displayName, multiplier: item.multiplier, enabled: item.enabled });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditValues({});
  };

  const requestSave = () => {
    if (editId === null) return;
    setConfirm({ id: editId, values: editValues });
  };

  const doSave = async () => {
    if (!confirm) return;
    setSaving(true);
    try {
      const token = getAuthToken();
      await fetch(`/api/settings/pricing-methods/${confirm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(confirm.values),
      });
      await mutate();
      setEditId(null);
      setEditValues({});
    } finally {
      setSaving(false);
      setConfirm(null);
    }
  };

  return (
    <div className={styles.panelContent}>
      <div className={styles.infoCard}>
        <span className={styles.infoIcon}>💲</span>
        <div>
          <div className={styles.infoTitle}>내부대체 가격 정책</div>
          <div className={styles.infoDesc}>
            지원본부의 간접비를 수익본부에 배분할 때 적용하는 가격 배율입니다.
            예: <strong>원가 + 20%</strong>는 간접비에 1.2를 곱한 금액을 수익본부에 부과합니다.
            비활성화된 정책은 내부대체가액 분석 화면의 드롭다운에서 숨겨집니다.
          </div>
        </div>
      </div>

      <div className={styles.groupCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>코드</th>
              <th>표시명</th>
              <th>배율</th>
              <th>상태</th>
              <th style={{ width: '120px' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td><code className={styles.codeBadge}>{item.code}</code></td>
                <td>
                  {editId === item.id ? (
                    <input
                      className={styles.editInput}
                      value={editValues.displayName ?? ''}
                      onChange={(e) => setEditValues((v) => ({ ...v, displayName: e.target.value }))}
                    />
                  ) : (
                    item.displayName
                  )}
                </td>
                <td className={styles.num}>
                  {editId === item.id ? (
                    <input
                      className={styles.editInput}
                      type="number"
                      step="0.01"
                      value={editValues.multiplier ?? 1}
                      onChange={(e) => setEditValues((v) => ({ ...v, multiplier: parseFloat(e.target.value) }))}
                      style={{ width: '80px' }}
                    />
                  ) : (
                    `×${item.multiplier.toFixed(2)}`
                  )}
                </td>
                <td>
                  {editId === item.id ? (
                    <label className={styles.toggleWrap}>
                      <input
                        type="checkbox"
                        checked={editValues.enabled ?? true}
                        onChange={(e) => setEditValues((v) => ({ ...v, enabled: e.target.checked }))}
                      />
                      <span className={styles.toggleLabel}>{editValues.enabled ? '활성' : '비활성'}</span>
                    </label>
                  ) : (
                    <span className={`${styles.statusBadge} ${item.enabled ? styles.statusOn : styles.statusOff}`}>
                      {item.enabled ? '활성' : '비활성'}
                    </span>
                  )}
                </td>
                <td>
                  {editId === item.id ? (
                    <div className={styles.editActions}>
                      <button className={styles.saveBtn} onClick={requestSave} disabled={saving}>저장</button>
                      <button className={styles.cancelBtn} onClick={cancelEdit}>취소</button>
                    </div>
                  ) : (
                    <button className={styles.editBtn} onClick={() => startEdit(item)}>수정</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 확인 다이얼로그 */}
      {confirm && (
        <div className={styles.modalOverlay} onClick={() => setConfirm(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>⚠️ 변경 확인</h3>
            <p className={styles.modalDesc}>
              가격 정책을 변경하면 향후 내부대체가액 계산 결과에 영향을 줍니다.
              <br />변경 사항을 저장하시겠습니까?
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirm(null)}>취소</button>
              <button className={styles.confirmBtn} onClick={doSave} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   배부 기준 관리 패널
   ────────────────────────────────────────────────────────── */
function CostDriverPanel() {
  const { data, error, isLoading, mutate } = useFetch<CostDriverSetting[]>('/settings/cost-drivers');
  const [editId, setEditId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<CostDriverSetting>>({});
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<{ id: number; values: Partial<CostDriverSetting> } | null>(null);

  if (isLoading) return <LoadingState text="배부 기준 데이터를 불러오는 중..." />;
  if (error || !data) return <ErrorState />;

  const startEdit = (item: CostDriverSetting) => {
    setEditId(item.id);
    setEditValues({ displayName: item.displayName, description: item.description, enabled: item.enabled });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditValues({});
  };

  const requestSave = () => {
    if (editId === null) return;
    setConfirm({ id: editId, values: editValues });
  };

  const doSave = async () => {
    if (!confirm) return;
    setSaving(true);
    try {
      const token = getAuthToken();
      await fetch(`/api/settings/cost-drivers/${confirm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(confirm.values),
      });
      await mutate();
      setEditId(null);
      setEditValues({});
    } finally {
      setSaving(false);
      setConfirm(null);
    }
  };

  return (
    <div className={styles.panelContent}>
      <div className={styles.infoCard}>
        <span className={styles.infoIcon}>🔀</span>
        <div>
          <div className={styles.infoTitle}>간접비 배부 기준</div>
          <div className={styles.infoDesc}>
            지원본부의 간접비를 수익본부에 배분할 때 사용하는 배부 기준(Cost Driver)입니다.
            각 기준은 서로 다른 관점에서 수익본부의 간접비 부담 비율을 산정합니다.
            비활성화된 기준은 분석 화면의 드롭다운에서 숨겨집니다.
          </div>
        </div>
      </div>

      <div className={styles.groupCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>코드</th>
              <th>표시명</th>
              <th>설명</th>
              <th>상태</th>
              <th style={{ width: '120px' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td><code className={styles.codeBadge}>{item.code}</code></td>
                <td>
                  {editId === item.id ? (
                    <input
                      className={styles.editInput}
                      value={editValues.displayName ?? ''}
                      onChange={(e) => setEditValues((v) => ({ ...v, displayName: e.target.value }))}
                    />
                  ) : (
                    item.displayName
                  )}
                </td>
                <td className={styles.descCell}>
                  {editId === item.id ? (
                    <input
                      className={styles.editInput}
                      value={editValues.description ?? ''}
                      onChange={(e) => setEditValues((v) => ({ ...v, description: e.target.value }))}
                    />
                  ) : (
                    <span className={styles.descText}>{item.description}</span>
                  )}
                </td>
                <td>
                  {editId === item.id ? (
                    <label className={styles.toggleWrap}>
                      <input
                        type="checkbox"
                        checked={editValues.enabled ?? true}
                        onChange={(e) => setEditValues((v) => ({ ...v, enabled: e.target.checked }))}
                      />
                      <span className={styles.toggleLabel}>{editValues.enabled ? '활성' : '비활성'}</span>
                    </label>
                  ) : (
                    <span className={`${styles.statusBadge} ${item.enabled ? styles.statusOn : styles.statusOff}`}>
                      {item.enabled ? '활성' : '비활성'}
                    </span>
                  )}
                </td>
                <td>
                  {editId === item.id ? (
                    <div className={styles.editActions}>
                      <button className={styles.saveBtn} onClick={requestSave} disabled={saving}>저장</button>
                      <button className={styles.cancelBtn} onClick={cancelEdit}>취소</button>
                    </div>
                  ) : (
                    <button className={styles.editBtn} onClick={() => startEdit(item)}>수정</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 확인 다이얼로그 */}
      {confirm && (
        <div className={styles.modalOverlay} onClick={() => setConfirm(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>⚠️ 변경 확인</h3>
            <p className={styles.modalDesc}>
              배부 기준을 변경하면 향후 내부대체가액 및 표준원가 배분 결과에 영향을 줍니다.
              <br />변경 사항을 저장하시겠습니까?
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirm(null)}>취소</button>
              <button className={styles.confirmBtn} onClick={doSave} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   공통 상태 컴포넌트
   ────────────────────────────────────────────────────────── */
function LoadingState({ text }: { text: string }) {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <span>{text}</span>
    </div>
  );
}

function ErrorState() {
  return (
    <div className={styles.error}>
      <span>⚠️</span>
      <span>데이터를 불러올 수 없습니다.</span>
    </div>
  );
}
