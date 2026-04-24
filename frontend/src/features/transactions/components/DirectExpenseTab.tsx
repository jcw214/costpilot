'use client';

import { useEffect, useState } from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';
import { transactionApi } from '../api';
import { DirectExpense } from '../types';
import { formatKRW } from '@/lib/format';

export default function DirectExpenseTab() {
  const [data, setData] = useState<DirectExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionApi.getDirectExpenses()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<DirectExpense>[] = [
    { key: 'projectName', label: '프로젝트' },
    { key: 'costType', label: '비용 유형' },
    { key: 'vendorName', label: '업체명' },
    { key: 'amount', label: '금액', render: (val: unknown) => formatKRW(val as number) },
    { key: 'costDate', label: '발생 일자' },
  ];

  return <DataTable data={data} columns={columns} loading={loading} />;
}
