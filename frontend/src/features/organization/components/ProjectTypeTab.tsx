'use client';

import { useEffect, useState } from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';
import { getProjectTypes } from '../api';
import type { ProjectType } from '../types';

export default function ProjectTypeTab() {
  const [data, setData] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjectTypes()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<ProjectType>[] = [
    { key: 'id', label: 'ID', width: '60px', align: 'center' },
    { key: 'name', label: '유형명' },
  ];

  return (
    <DataTable columns={columns} data={data} loading={loading} />
  );
}
