import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { DefectBreakdownDTO } from '@/types/equipment';

interface DefectDonutChartProps {
  data: DefectBreakdownDTO;
}

const COLORS = {
  goFail: '#f97316', // orange — False Reject (Go fail)
  noGoFail: '#ef4444', // red    — Missed Defect (No-Go fail, nghiêm trọng nhất)
  programFail: '#eab308', // yellow — Program/Software fail
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold mb-1" style={{ color: item.payload.color }}>
        {item.name}
      </p>
      <p className="text-text-secondary">Count: <span className="font-medium text-text-primary">{item.payload.count}</span></p>
      <p className="text-text-secondary">Rate: <span className="font-medium text-text-primary">{item.value}%</span></p>
    </div>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
  if (value < 3) return null; // quá nhỏ thì không label
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${value}%`}
    </text>
  );
};

export const DefectDonutChart: React.FC<DefectDonutChartProps> = ({ data }) => {
  const total = data.goFailCount + data.noGoFailCount + data.programFailCount;

  const chartData = [
    {
      name: 'Go Fail',
      value: data.goFailPercent,
      count: data.goFailCount,
      color: COLORS.goFail,
    },
    {
      name: 'No-Go Fail',
      value: data.noGoFailPercent,
      count: data.noGoFailCount,
      color: COLORS.noGoFail,
    },
    {
      name: 'Program Fail',
      value: data.programFailPercent,
      count: data.programFailCount,
      color: COLORS.programFail,
    },
  ].filter((d) => d.count > 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <span className="material-symbols-outlined text-[40px] text-status-ok">verified</span>
        <p className="text-sm text-text-secondary font-medium">No failures recorded</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Center label */}
      <div className="relative flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="75%"
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-text-primary">{total}</span>
          <span className="text-xs text-text-muted">Total Fails</span>
        </div>
      </div>
      {/* Legend with counts */}
      <div className="flex flex-col gap-1.5 px-2 pb-1 mt-1">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="text-text-secondary">{d.name}</span>
            </div>
            <span className="font-medium text-text-primary">{d.count} ({d.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};
