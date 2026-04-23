'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import { transactionApi } from '../api';
import { TimeEntry } from '../types';

export default function TimeEntryTab() {
  const [data, setData] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionApi.getTimeEntries()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'id', label: 'ID', width: '80px' },
    { key: 'employeeName', label: '직원명' },
    { key: 'projectName', label: '프로젝트' },
    { key: 'activityType', label: '활동 유형' },
    { key: 'workDate', label: '근무 일자' },
    { key: 'hours', label: '투입 시간', render: (val: any) => val.toFixed(1) },
  ];

  return <DataTable data={data} columns={columns} loading={loading} />;
}
