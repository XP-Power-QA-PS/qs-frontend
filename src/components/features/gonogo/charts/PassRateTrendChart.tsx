import React from 'react';
import {
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DailyTrendDTO } from '@/types/equipment';

interface PassRateTrendChartProps {
  data: DailyTrendDTO[];
  /** 'line-area' = xu hướng pass rate | 'stacked-bar' = phân bổ PASS vs FAIL */
  mode?: 'line-area' | 'stacked-bar';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl shadow-lg px-4 py-3 text-sm min-w-[180px]">
      <p className="font-semibold text-text-primary mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span className="text-text-secondary">{p.name}</span>
          <span className="font-medium" style={{ color: p.color }}>
            {typeof p.value === 'number' && p.name === 'Pass Rate'
              ? `${p.value}%`
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const PassRateTrendChart: React.FC<PassRateTrendChartProps> = ({
  data,
  mode = 'line-area',
}) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-text-muted">
        No data available for selected period
      </div>
    );
  }

  // Format date label gọn hơn: "05/09"
  const formatted = data.map((d) => ({
    ...d,
    label: d.testDate.slice(5).replace('-', '/'),
  }));

  if (mode === 'stacked-bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={formatted} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle, #e5e7eb)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-text-muted, #9ca3af)' }} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted, #9ca3af)' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="passCount" name="PASS" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
          <Bar dataKey="failCount" name="FAIL" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  // Default: Line + Area mode
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={formatted} margin={{ top: 8, right: 40, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="passRateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="attemptsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle, #e5e7eb)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: 'var(--color-text-muted, #9ca3af)' }}
        />
        {/* Trục trái: số lượt */}
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11, fill: 'var(--color-text-muted, #9ca3af)' }}
          width={36}
        />
        {/* Trục phải: % */}
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: 'var(--color-text-muted, #9ca3af)' }}
          width={44}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {/* Total Attempts - Area */}
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="totalAttempts"
          name="Total Attempts"
          stroke="#8b5cf6"
          strokeWidth={1.5}
          fill="url(#attemptsGrad)"
          dot={false}
        />
        {/* Pass Rate - Line */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="passRate"
          name="Pass Rate"
          stroke="#0ea5e9"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#0ea5e9' }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
