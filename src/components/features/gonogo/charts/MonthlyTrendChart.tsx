import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlyStatsDTO } from '@/types/equipment';

interface MonthlyTrendChartProps {
  data: MonthlyStatsDTO[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as MonthlyStatsDTO;
  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl shadow-lg px-4 py-3 text-sm min-w-[180px]">
      <p className="font-semibold text-text-primary mb-2">{d.label}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Pass Rate</span>
          <span className="font-bold text-sky-500">{d.passRate}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Total Attempts</span>
          <span className="font-medium text-text-primary">{d.totalAttempts}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-status-ok">PASS</span>
          <span className="font-medium text-text-primary">{d.passCount}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-status-critical">FAIL</span>
          <span className="font-medium text-text-primary">{d.failCount}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Days tested</span>
          <span className="font-medium text-text-primary">{d.totalDays}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Avg per day</span>
          <span className="font-medium text-text-primary">{d.avgAttemptsPerDay}</span>
        </div>
      </div>
    </div>
  );
};

// Dot tô màu theo pass rate
const ColoredDot = (props: any) => {
  const { cx, cy, payload } = props;
  const color = payload.passRate >= 80 ? '#22c55e' : payload.passRate >= 60 ? '#f97316' : '#ef4444';
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />;
};

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data }) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-text-muted">
        No monthly history available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle, #e5e7eb)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-text-muted, #9ca3af)' }} />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: 'var(--color-text-muted, #9ca3af)' }}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        {/* Reference lines */}
        <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '80%', position: 'right', fontSize: 10, fill: '#22c55e' }} />
        <ReferenceLine y={60} stroke="#f97316" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '60%', position: 'right', fontSize: 10, fill: '#f97316' }} />
        <Line
          type="monotone"
          dataKey="passRate"
          name="Pass Rate"
          stroke="#0ea5e9"
          strokeWidth={2.5}
          dot={<ColoredDot />}
          activeDot={{ r: 6, fill: '#0ea5e9' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
