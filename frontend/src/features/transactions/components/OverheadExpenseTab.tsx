'use client';

import { useEffect, useState } from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';
import { transactionApi } from '../api';
import { OverheadExpense } from '../types';
import { formatKRW } from '@/lib/format';

export default function OverheadExpenseTab() {
  const [data, setData] = useState<OverheadExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionApi.getOverheadExpenses()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<OverheadExpense>[] = [
    { key: 'departmentName', label: '지원본부명' },
    { key: 'costCategory', label: '비용 유형' },
    { key: 'amount', label: '금액', render: (val: unknown) => formatKRW(val as number) },
    { key: 'costMonth', label: '발생 월' },
  ];

  return <DataTable data={data} columns={columns} loading={loading} />;
}
