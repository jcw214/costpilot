'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatKRWShort } from '@/lib/format';
import { COLORS } from '@/lib/constants';

interface WaterfallItem {
  name: string;
  value: number;
  isTotal?: boolean;
}

interface WaterfallChartProps {
  data: WaterfallItem[];
  height?: number;
}

/**
 * Waterfall 차트: 표준원가 → 차이 요인별 증감 → 실제원가 시각화
 * Recharts에는 네이티브 waterfall이 없으므로 invisible + visible bar로 구현
 */
export default function WaterfallChart({ data, height = 360 }: WaterfallChartProps) {
  // 누적 base 계산
  let cumulative = 0;
  const chartData = data.map((item) => {
    if (item.isTotal) {
      return { name: item.name, base: 0, value: item.value, fill: COLORS.series[0] };
    }
    const base = item.value >= 0 ? cumulative : cumulative + item.value;
    const barVal = Math.abs(item.value);
    const fill = item.value >= 0 ? COLORS.unfavorable : COLORS.favorable;
    cumulative += item.value;
    return { name: item.name, base, value: barVal, fill };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: '#64748b' }}
          axisLine={{ stroke: '#cbd5e1' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatKRWShort(v as number)}
        />
        <Tooltip
          formatter={(value) => [formatKRWShort(value as number), '금액']}
          contentStyle={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        />
        <ReferenceLine y={0} stroke="#94a3b8" />
        {/* Invisible base */}
        <Bar dataKey="base" stackId="waterfall" fill="transparent" />
        {/* Visible bar */}
        <Bar dataKey="value" stackId="waterfall" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
