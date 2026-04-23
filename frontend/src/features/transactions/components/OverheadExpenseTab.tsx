'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import { transactionApi } from '../api';
import { OverheadExpense } from '../types';
import { formatCurrency } from '@/lib/format';

export default function OverheadExpenseTab() {
  const [data, setData] = useState<OverheadExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionApi.getOverheadExpenses()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'departmentName', header: '지원본부명' },
    { key: 'costCategory', header: '비용 유형' },
    { key: 'amount', header: '금액', render: (val: number) => formatCurrency(val) },
    { key: 'costMonth', header: '발생 월' },
  ];

  return <DataTable data={data} columns={columns} loading={loading} />;
}
