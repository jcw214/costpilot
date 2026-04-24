'use client';

import { useEffect, useState, useCallback } from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';
import FilterBar, { FilterField } from '@/components/ui/FilterBar';
import Badge from '@/components/ui/Badge';
import { getDepartments } from '../api';
import type { Department } from '../types';

export default function DepartmentTab() {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getDepartments(typeFilter || undefined));
    } catch { /* noop */ }
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => { load(); }, [load]);

  const columns: Column<Department>[] = [
    { key: 'name', label: '본부명' },
    {
      key: 'type', label: '유형', width: '100px', align: 'center',
      render: (val) => (
        <Badge variant={val === '수익' ? 'info' : 'warning'}>
          {val as string}
        </Badge>
      ),
    },
    {
      key: 'employeeCount', label: '인원', width: '80px', align: 'right',
      render: (val) => `${val}명`,
    },
  ];

  const filters: FilterField[] = [
    {
      key: 'type', label: '유형', value: typeFilter,
      options: [
        { value: '수익', label: '수익' },
        { value: '지원', label: '지원' },
      ],
    },
  ];

  return (
    <>
      <FilterBar
        filters={filters}
        onChange={(_, val) => setTypeFilter(val)}
        onReset={() => setTypeFilter('')}
      />
      <DataTable columns={columns} data={data} loading={loading} />
    </>
  );
}
