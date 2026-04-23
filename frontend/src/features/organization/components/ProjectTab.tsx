'use client';

import { useEffect, useState, useCallback } from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';
import FilterBar, { FilterField } from '@/components/ui/FilterBar';
import Badge from '@/components/ui/Badge';
import { getDepartments, getProjects } from '../api';
import { formatKRW } from '@/lib/format';
import type { Department, Project } from '../types';

export default function ProjectTab() {
  const [data, setData] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  const columns: Column<Project>[] = [
    { key: 'id', label: 'ID', width: '60px', align: 'center' },
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
      key: 'contractAmount', label: '계약매출', width: '140px', align: 'right',
      render: (val) => formatKRW(val as number),
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
