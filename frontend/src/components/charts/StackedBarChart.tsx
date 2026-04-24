'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatKRWShort } from '@/lib/format';
import { COLORS } from '@/lib/constants';

interface StackedBarChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  bars: { dataKey: string; name: string; color?: string }[];
  height?: number;
  yFormatter?: (value: number) => string;
}

export default function StackedBarChart({
  data,
  xKey,
  bars,
  height = 360,
  yFormatter = formatKRWShort,
}: StackedBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: '#64748b' }}
          axisLine={{ stroke: '#cbd5e1' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => yFormatter(v as number)}
        />
        <Tooltip
          formatter={(value, name) => [yFormatter(value as number), name as string]}
          contentStyle={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        {bars.map((b, i) => (
          <Bar
            key={b.dataKey}
            dataKey={b.dataKey}
            name={b.name}
            stackId="stack"
            fill={b.color || COLORS.series[i % COLORS.series.length]}
            radius={i === bars.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
