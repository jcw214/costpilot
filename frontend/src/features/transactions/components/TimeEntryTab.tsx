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
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'employeeName', header: '직원명' },
    { key: 'projectName', header: '프로젝트' },
    { key: 'activityType', header: '활동 유형' },
    { key: 'workDate', header: '근무 일자' },
    { key: 'hours', header: '투입 시간', render: (val: number) => val.toFixed(1) },
  ];

  return <DataTable data={data} columns={columns} loading={loading} />;
}
