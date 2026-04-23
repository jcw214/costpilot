'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import { transactionApi } from '../api';
import { DirectExpense } from '../types';
import { formatCurrency } from '@/lib/format';

export default function DirectExpenseTab() {
  const [data, setData] = useState<DirectExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionApi.getDirectExpenses()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'projectName', header: '프로젝트' },
    { key: 'costType', header: '비용 유형' },
    { key: 'vendorName', header: '업체명' },
    { key: 'amount', header: '금액', render: (val: number) => formatCurrency(val) },
    { key: 'costDate', header: '발생 일자' },
  ];

  return <DataTable data={data} columns={columns} loading={loading} />;
}
