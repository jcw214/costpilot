'use client';

import { useState, useMemo } from 'react';
import styles from './SortableTable.module.css';

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => number | string;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

interface SortableTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T, idx: number) => string | number;
  pageSize?: number;
}

type SortDir = 'asc' | 'desc' | null;

export default function SortableTable<T>({
  columns,
  data,
  rowKey,
  pageSize = 10,
}: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(0);

  const handleSort = (col: Column<T>) => {
    if (!col.sortValue) return;
    if (sortKey === col.key) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') { setSortKey(null); setSortDir(null); }
      else setSortDir('asc');
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;
    const fn = col.sortValue;
    return [...data].sort((a, b) => {
      const va = fn(a);
      const vb = fn(b);
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb), 'ko')
        : String(vb).localeCompare(String(va), 'ko');
    });
  }, [data, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const getSortIcon = (col: Column<T>) => {
    if (!col.sortValue) return null;
    if (sortKey !== col.key || !sortDir) return <span className={styles.sortIcon}>⇅</span>;
    return <span className={styles.sortIconActive}>{sortDir === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${col.sortValue ? styles.sortable : ''}`}
                  style={{ textAlign: col.align || 'left', width: col.width }}
                  onClick={() => handleSort(col)}
                >
                  <span className={styles.thContent}>
                    {col.label}
                    {getSortIcon(col)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, idx) => (
              <tr key={rowKey(row, page * pageSize + idx)}>
                {columns.map((col) => (
                  <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length > pageSize && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            총 {sorted.length}건 중 {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)}
          </span>
          <div className={styles.pageButtons}>
            <button disabled={page === 0} onClick={() => setPage(0)}>«</button>
            <button disabled={page === 0} onClick={() => setPage(page - 1)}>‹</button>
            <span className={styles.pageCurrent}>{page + 1} / {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>›</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>»</button>
          </div>
        </div>
      )}
    </div>
  );
}
