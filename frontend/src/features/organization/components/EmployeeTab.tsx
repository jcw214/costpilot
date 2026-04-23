'use client';

import { useEffect, useState, useCallback } from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';
import FilterBar, { FilterField } from '@/components/ui/FilterBar';
import { getDepartments, getEmployees, getJobGrades } from '../api';
import { formatKRW } from '@/lib/format';
import type { Department, Employee, JobGrade } from '../types';

export default function EmployeeTab() {
  const [data, setData] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobGrades, setJobGrades] = useState<JobGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

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

  const columns: Column<Employee>[] = [
    { key: 'id', label: 'ID', width: '60px', align: 'center' },
    { key: 'name', label: '이름' },
    { key: 'departmentName', label: '소속 본부' },
    { key: 'jobGradeCode', label: '직급코드', width: '80px', align: 'center' },
    { key: 'jobGradeName', label: '직급명' },
    {
      key: 'hourlyRate', label: '실제시급', width: '120px', align: 'right',
      render: (val) => formatKRW(val as number),
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
