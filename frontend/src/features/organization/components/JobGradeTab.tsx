'use client';

import { useEffect, useState, useCallback } from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';
import { getJobGrades, updateJobGradeRate } from '../api';
import { formatKRW } from '@/lib/format';
import type { JobGrade } from '../types';
import styles from '../MasterView.module.css';

export default function JobGradeTab() {
  const [data, setData] = useState<JobGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getJobGrades());
    } catch { /* noop */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (id: number) => {
    const rate = parseInt(editValue, 10);
    if (isNaN(rate) || rate <= 0) return;
    try {
      await updateJobGradeRate(id, rate);
      setEditId(null);
      load();
    } catch { /* noop */ }
  };

  const columns: Column<JobGrade>[] = [
    {
      key: 'code', label: '코드', width: '80px', align: 'center',
      render: (val) => <span style={{ fontWeight: 600 }}>{val as string}</span>,
    },
    { key: 'name', label: '직급명' },
    {
      key: 'standardHourlyRate', label: '표준시급', width: '200px', align: 'right',
      render: (val, row) => {
        const grade = row as JobGrade;
        if (editId === grade.id) {
          return (
            <div className={styles.editCell}>
              <input
                className={styles.editInput}
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave(grade.id)}
                autoFocus
              />
              <button className={styles.saveBtn} onClick={() => handleSave(grade.id)}>저장</button>
              <button className={styles.cancelBtn} onClick={() => setEditId(null)}>취소</button>
            </div>
          );
        }
        return (
          <span
            className={styles.editableValue}
            onClick={() => { setEditId(grade.id); setEditValue(String(val)); }}
            title="클릭하여 수정"
          >
            {formatKRW(val as number)}
            <span className={styles.editIcon}>✏️</span>
          </span>
        );
      },
    },
  ];

  return (
    <>
      <div className={styles.infoBox}>
        💡 표준시급을 클릭하면 수정할 수 있습니다. 변경 시 차이 분석 결과가 연동 변경됩니다.
      </div>
      <DataTable columns={columns} data={data} loading={loading} />
    </>
  );
}
