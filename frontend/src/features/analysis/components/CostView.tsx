'use client';

import { useEffect, useState } from 'react';
import { getCostAggregation } from '../api';
import type { CostAggregation, DepartmentCost, ProjectCost, EmployeeCost } from '../types';
import { formatKRW } from '@/lib/format';
import SortableTable, { type Column } from '@/components/ui/SortableTable';
import styles from './CostView.module.css';

type DrillLevel = 'company' | 'department' | 'project';

const EMP_COLS: Column<EmployeeCost>[] = [
  { key: 'name', label: '직원명', render: (e) => e.employeeName, sortValue: (e) => e.employeeName },
  { key: 'hours', label: '투입 시간(h)', align: 'right', render: (e) => e.hours.toString(), sortValue: (e) => e.hours },
  { key: 'cost', label: '인건비', align: 'right', render: (e) => formatKRW(e.laborCost), sortValue: (e) => e.laborCost },
];

export default function CostView() {
  const [data, setData] = useState<CostAggregation | null>(null);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState<DrillLevel>('company');
  const [selectedDept, setSelectedDept] = useState<DepartmentCost | null>(null);
  const [selectedProj, setSelectedProj] = useState<ProjectCost | null>(null);

  useEffect(() => {
    getCostAggregation()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>원가 데이터를 집계하는 중...</span>
      </div>
    );
  }

  if (!data) {
    return <div className={styles.empty}>데이터를 불러올 수 없습니다.</div>;
  }

  const handleDeptClick = (dept: DepartmentCost) => {
    setSelectedDept(dept);
    setSelectedProj(null);
    setLevel('department');
  };

  const handleProjClick = (proj: ProjectCost) => {
    setSelectedProj(proj);
    setLevel('project');
  };

  const handleBreadcrumb = (target: DrillLevel) => {
    if (target === 'company') {
      setSelectedDept(null);
      setSelectedProj(null);
    } else if (target === 'department') {
      setSelectedProj(null);
    }
    setLevel(target);
  };

  return (
    <div className={styles.container}>
      {/* 전사 총원가 요약 카드 */}
      <div className={styles.summaryCard}>
        <span className={styles.summaryLabel}>전사 총원가</span>
        <span className={styles.summaryValue}>{formatKRW(data.companyTotalCost)}</span>
      </div>

      {/* 브레드크럼 네비게이션 */}
      <div className={styles.breadcrumb}>
        <button
          className={level === 'company' ? styles.breadcrumbActive : styles.breadcrumbItem}
          onClick={() => handleBreadcrumb('company')}
        >
          전사
        </button>
        {selectedDept && (
          <>
            <span className={styles.breadcrumbSep}>›</span>
            <button
              className={level === 'department' ? styles.breadcrumbActive : styles.breadcrumbItem}
              onClick={() => handleBreadcrumb('department')}
            >
              {selectedDept.departmentName}
            </button>
          </>
        )}
        {selectedProj && (
          <>
            <span className={styles.breadcrumbSep}>›</span>
            <button className={styles.breadcrumbActive}>
              {selectedProj.projectName}
            </button>
          </>
        )}
      </div>

      {/* Level: 전사 → 본부 목록 */}
      {level === 'company' && (
        <div className={styles.grid}>
          {data.departments.map((dept) => (
            <div
              key={dept.departmentName}
              className={styles.card}
              onClick={() => handleDeptClick(dept)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>{dept.departmentName}</span>
                <span className={styles.cardBadge}>{dept.projects.length}개 프로젝트</span>
              </div>
              <div className={styles.cardValue}>{formatKRW(dept.totalCost)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Level: 본부 → 프로젝트 목록 */}
      {level === 'department' && selectedDept && (
        <div className={styles.grid}>
          {selectedDept.projects.map((proj) => (
            <div
              key={proj.projectName}
              className={styles.card}
              onClick={() => handleProjClick(proj)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>{proj.projectName}</span>
                <span className={styles.cardBadge}>{proj.employees.length}명</span>
              </div>
              <div className={styles.cardValue}>{formatKRW(proj.totalProjectCost)}</div>
              <div className={styles.cardMeta}>
                <span>인건비: {formatKRW(proj.laborCost)}</span>
                <span>직접비: {formatKRW(proj.directExpense)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Level: 프로젝트 → 인력 목록 */}
      {level === 'project' && selectedProj && (
        <div className={styles.tableWrap}>
          <div className={styles.projSummary}>
            <div className={styles.projStat}>
              <span className={styles.projStatLabel}>총 프로젝트 원가</span>
              <span className={styles.projStatValue}>{formatKRW(selectedProj.totalProjectCost)}</span>
            </div>
            <div className={styles.projStat}>
              <span className={styles.projStatLabel}>인건비</span>
              <span className={styles.projStatValue}>{formatKRW(selectedProj.laborCost)}</span>
            </div>
            <div className={styles.projStat}>
              <span className={styles.projStatLabel}>직접경비</span>
              <span className={styles.projStatValue}>{formatKRW(selectedProj.directExpense)}</span>
            </div>
          </div>
          <SortableTable
            columns={EMP_COLS}
            data={selectedProj.employees}
            rowKey={(e) => e.employeeName}
          />
        </div>
      )}
    </div>
  );
}
