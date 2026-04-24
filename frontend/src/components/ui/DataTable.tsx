'use client';

import { useState, useMemo } from 'react';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean; // default: true
  searchable?: boolean; // default: true
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
}

type SortDir = 'asc' | 'desc' | null;

export default function DataTable<T extends object>({
  columns,
  data,
  loading = false,
  emptyMessage = '데이터가 없습니다.',
  pageSize = 20,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(0);

  // ── 검색 필터 ──
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        if (col.searchable === false) return false;
        const val = (row as Record<string, unknown>)[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  // ── 정렬 ──
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal), 'ko');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // ── 페이지네이션 ──
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paged = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') { setSortKey(null); setSortDir(null); }
      else setSortDir('asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return '↕';
    if (sortDir === 'asc') return '↑';
    return '↓';
  };

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* 검색 바 */}
      {data.length > 0 && (
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="검색어를 입력하세요..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
            {search && (
              <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <span className={styles.resultCount}>
            {filtered.length !== data.length
              ? `${filtered.length} / ${data.length}건`
              : `총 ${data.length}건`}
          </span>
        </div>
      )}

      {/* 테이블 */}
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => {
                const canSort = col.sortable !== false;
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width, textAlign: col.align || 'left' }}
                    className={canSort ? styles.sortable : ''}
                    onClick={() => canSort && handleSort(col.key)}
                  >
                    {col.label}
                    {canSort && <span className={styles.sortIcon}>{getSortIcon(col.key)}</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.empty}>
                  {search ? '검색 결과가 없습니다.' : emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col) => (
                    <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                      {col.render
                        ? col.render((row as Record<string, unknown>)[col.key], row)
                        : ((row as Record<string, unknown>)[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={safePage === 0} onClick={() => setPage(0)}>«</button>
          <button className={styles.pageBtn} disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>‹</button>
          <span className={styles.pageInfo}>{safePage + 1} / {totalPages}</span>
          <button className={styles.pageBtn} disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}>›</button>
          <button className={styles.pageBtn} disabled={safePage >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>»</button>
        </div>
      )}

      {/* 단일 페이지일 때 하단 건수 표시 */}
      {totalPages <= 1 && data.length > 0 && (
        <div className={styles.footer}>
          총 <strong>{data.length}</strong>건
        </div>
      )}
    </div>
  );
}
