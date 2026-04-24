'use client';

import { useEffect, useState, useCallback } from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';
import FilterBar, { FilterField } from '@/components/ui/FilterBar';
import { getDepartments, getEmployees, getJobGrades, updateEmployeeHourlyRate } from '../api';
import { formatKRW } from '@/lib/format';
import type { Department, Employee, JobGrade } from '../types';
import styles from '../MasterView.module.css';

export default function EmployeeTab() {
  const [data, setData] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobGrades, setJobGrades] = useState<JobGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => {});
    getJobGrades().then(setJobGrades).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getEmployees(deptFilter || undefined, gradeFilter || undefined));
    } catch { /* noop */ }
    setLoading(false);
  }, [deptFilter, gradeFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (id: number) => {
    const rate = parseInt(editValue, 10);
    if (isNaN(rate) || rate <= 0) return;
    try {
      await updateEmployeeHourlyRate(id, rate);
      setEditId(null);
      load();
    } catch { /* noop */ }
  };

  const columns: Column<Employee>[] = [
    { key: 'name', label: '이름' },
    { key: 'departmentName', label: '소속 본부' },
    { key: 'jobGradeCode', label: '직급코드', width: '80px', align: 'center' },
    { key: 'jobGradeName', label: '직급명' },
    {
      key: 'hourlyRate', label: '실제시급', width: '160px', align: 'right',
      render: (val, row) => {
        const emp = row as Employee;
        if (editId === emp.id) {
          return (
            <div className={styles.editCell}>
              <input
                className={styles.editInput}
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave(emp.id)}
                autoFocus
              />
              <button className={styles.saveBtn} onClick={() => handleSave(emp.id)}>저장</button>
              <button className={styles.cancelBtn} onClick={() => setEditId(null)}>취소</button>
            </div>
          );
        }
        return (
          <span
            className={styles.editableValue}
            onClick={() => { setEditId(emp.id); setEditValue(String(val)); }}
            title="클릭하여 수정"
          >
            {formatKRW(val as number)}
            <span className={styles.editIcon}>✏️</span>
          </span>
        );
      },
    },
    {
      key: 'standardHourlyRate', label: '표준시급', width: '120px', align: 'right',
      render: (val) => formatKRW(val as number),
    },
    {
      key: 'hourlyRate', label: '차이', width: '100px', align: 'right',
      render: (_, row) => {
        const emp = row as Employee;
        const diff = emp.hourlyRate - emp.standardHourlyRate;
        if (diff === 0) return <span style={{ color: '#6B7280' }}>—</span>;
        return (
          <span style={{ color: diff > 0 ? '#EF4444' : '#10B981', fontWeight: 600, fontSize: '12px' }}>
            {diff > 0 ? '+' : ''}{formatKRW(diff)}
          </span>
        );
      },
    },
  ];

  const filters: FilterField[] = [
    {
      key: 'departmentId', label: '본부', value: deptFilter,
      options: departments.map((d) => ({ value: String(d.id), label: d.name })),
    },
    {
      key: 'jobGradeId', label: '직급', value: gradeFilter,
      options: jobGrades.map((g) => ({ value: String(g.id), label: `${g.code} ${g.name}` })),
    },
  ];

  return (
    <>
      <div className={styles.infoBox}>
        💡 실제시급을 클릭하면 수정할 수 있습니다. 변경 시 원가 집계 및 차이 분석 결과에 반영됩니다.
      </div>
      <FilterBar
        filters={filters}
        onChange={(key, val) => {
          if (key === 'departmentId') setDeptFilter(val);
          if (key === 'jobGradeId') setGradeFilter(val);
        }}
        onReset={() => { setDeptFilter(''); setGradeFilter(''); }}
      />
      <DataTable columns={columns} data={data} loading={loading} />
    </>
  );
}
