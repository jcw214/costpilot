'use client';

import { useEffect, useState, useCallback } from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';
import FilterBar, { FilterField } from '@/components/ui/FilterBar';
import Badge from '@/components/ui/Badge';
import { getDepartments, getProjects, updateProjectContractAmount } from '../api';
import { formatKRW } from '@/lib/format';
import type { Department, Project } from '../types';
import styles from '../MasterView.module.css';

export default function ProjectTab() {
  const [data, setData] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getProjects(deptFilter || undefined, statusFilter || undefined));
    } catch { /* noop */ }
    setLoading(false);
  }, [deptFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (id: number) => {
    const amount = parseInt(editValue, 10);
    if (isNaN(amount) || amount <= 0) return;
    try {
      await updateProjectContractAmount(id, amount);
      setEditId(null);
      load();
    } catch { /* noop */ }
  };

  const columns: Column<Project>[] = [
    { key: 'name', label: '프로젝트명' },
    { key: 'departmentName', label: '소속 본부', width: '140px' },
    { key: 'projectTypeName', label: '유형', width: '160px' },
    {
      key: 'status', label: '상태', width: '90px', align: 'center',
      render: (val) => (
        <Badge variant={val === '진행중' ? 'favorable' : 'neutral'}>
          {val as string}
        </Badge>
      ),
    },
    {
      key: 'contractAmount', label: '계약매출', width: '180px', align: 'right',
      render: (val, row) => {
        const proj = row as Project;
        if (editId === proj.id) {
          return (
            <div className={styles.editCell}>
              <input
                className={styles.editInput}
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave(proj.id)}
                autoFocus
              />
              <button className={styles.saveBtn} onClick={() => handleSave(proj.id)}>저장</button>
              <button className={styles.cancelBtn} onClick={() => setEditId(null)}>취소</button>
            </div>
          );
        }
        return (
          <span
            className={styles.editableValue}
            onClick={() => { setEditId(proj.id); setEditValue(String(val)); }}
            title="클릭하여 수정"
          >
            {formatKRW(val as number)}
            <span className={styles.editIcon}>✏️</span>
          </span>
        );
      },
    },
    { key: 'startDate', label: '시작일', width: '110px', align: 'center' },
    { key: 'endDate', label: '종료일', width: '110px', align: 'center' },
  ];

  const filters: FilterField[] = [
    {
      key: 'departmentId', label: '본부', value: deptFilter,
      options: departments.map((d) => ({ value: String(d.id), label: d.name })),
    },
    {
      key: 'status', label: '상태', value: statusFilter,
      options: [
        { value: '진행중', label: '진행중' },
        { value: '완료', label: '완료' },
      ],
    },
  ];

  return (
    <>
      <div className={styles.infoBox}>
        💡 계약매출을 클릭하면 수정할 수 있습니다. 변경 시 수익성 분석 및 대시보드 이익률에 반영됩니다.
      </div>
      <FilterBar
        filters={filters}
        onChange={(key, val) => {
          if (key === 'departmentId') setDeptFilter(val);
          if (key === 'status') setStatusFilter(val);
        }}
        onReset={() => { setDeptFilter(''); setStatusFilter(''); }}
      />
      <DataTable columns={columns} data={data} loading={loading} />
    </>
  );
}
