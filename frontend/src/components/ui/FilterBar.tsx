'use client';

import styles from './FilterBar.module.css';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  label: string;
  options: FilterOption[];
  value: string;
}

interface FilterBarProps {
  filters: FilterField[];
  onChange: (key: string, value: string) => void;
  onReset?: () => void;
}

export default function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const hasActiveFilter = filters.some((f) => f.value !== '');

  return (
    <div className={styles.filterBar}>
      <div className={styles.filters}>
        {filters.map((filter) => (
          <div key={filter.key} className={styles.filterItem}>
            <label className={styles.label}>{filter.label}</label>
            <select
              className={styles.select}
              value={filter.value}
              onChange={(e) => onChange(filter.key, e.target.value)}
            >
              <option value="">전체</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {hasActiveFilter && onReset && (
        <button className={styles.resetBtn} onClick={onReset}>
          필터 초기화
        </button>
      )}
    </div>
  );
}
