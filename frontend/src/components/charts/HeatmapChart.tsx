'use client';

import { useMemo } from 'react';
import styles from './HeatmapChart.module.css';
import { COLORS } from '@/lib/constants';

interface HeatmapCell {
  row: string;
  col: string;
  value: number;
}

interface HeatmapChartProps {
  data: HeatmapCell[];
  valueFormatter?: (value: number) => string;
  colorScale?: { low: string; mid: string; high: string };
  height?: number;
}

function interpolateColor(ratio: number, low: string, mid: string, high: string): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const lerp = (a: number[], b: number[], t: number) =>
    a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const toHex = (rgb: number[]) =>
    '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');

  if (ratio <= 0.5) {
    return toHex(lerp(parse(low), parse(mid), ratio * 2));
  }
  return toHex(lerp(parse(mid), parse(high), (ratio - 0.5) * 2));
}

export default function HeatmapChart({
  data,
  valueFormatter = (v) => v.toFixed(1),
  colorScale = { low: COLORS.favorable, mid: '#FBBF24', high: COLORS.unfavorable },
}: HeatmapChartProps) {
  const { rows, cols, grid, min, max } = useMemo(() => {
    const rowSet = Array.from(new Set(data.map((d) => d.row)));
    const colSet = Array.from(new Set(data.map((d) => d.col)));
    const gridMap: Record<string, Record<string, number>> = {};
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (const d of data) {
      if (!gridMap[d.row]) gridMap[d.row] = {};
      gridMap[d.row][d.col] = d.value;
      if (d.value < minVal) minVal = d.value;
      if (d.value > maxVal) maxVal = d.value;
    }
    return { rows: rowSet, cols: colSet, grid: gridMap, min: minVal, max: maxVal };
  }, [data]);

  const range = max - min || 1;

  return (
    <div className={styles.wrapper}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.corner}></th>
              {cols.map((c) => (
                <th key={c} className={styles.colHeader}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r}>
                <td className={styles.rowHeader}>{r}</td>
                {cols.map((c) => {
                  const val = grid[r]?.[c] ?? 0;
                  const ratio = (val - min) / range;
                  const bg = interpolateColor(ratio, colorScale.low, colorScale.mid, colorScale.high);
                  return (
                    <td key={c} className={styles.cell} style={{ backgroundColor: bg }}>
                      {valueFormatter(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.legend}>
        <span>{valueFormatter(min)}</span>
        <div className={styles.gradient} style={{
          background: `linear-gradient(90deg, ${colorScale.low}, ${colorScale.mid}, ${colorScale.high})`,
        }} />
        <span>{valueFormatter(max)}</span>
      </div>
    </div>
  );
}
