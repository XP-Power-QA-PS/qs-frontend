import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BarChart3, ShieldAlert, ClipboardCheck, TrendingUp, RefreshCw, Filter } from 'lucide-react';
import { authService } from '@/services/auth';
import { useGoNoGoStats } from '@/hooks/useGoNoGoStats';
import { PassRateTrendChart } from '@/components/features/gonogo/charts/PassRateTrendChart';
import { DefectDonutChart } from '@/components/features/gonogo/charts/DefectDonutChart';
import { FloorComparisonChart } from '@/components/features/gonogo/charts/FloorComparisonChart';
import { WorstEquipmentsTable } from '@/components/features/gonogo/charts/WorstEquipmentsTable';

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  badge?: { label: string; variant: 'ok' | 'warn' | 'critical' };
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon, iconBg, badge }) => (
  <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-4 sm:p-5 flex items-start gap-4">
    <div className={`p-2.5 rounded-xl ${iconBg} text-white shrink-0 shadow-xs`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-label-md text-text-muted uppercase tracking-wider mb-0.5">{title}</p>
      <p className="text-2xl font-bold text-text-primary font-technical-data leading-tight">{value}</p>
      {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
    </div>
    {badge && (
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
        badge.variant === 'ok'
          ? 'bg-green-100 text-green-700'
          : badge.variant === 'warn'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-red-100 text-red-700'
      }`}>
        {badge.label}
      </span>
    )}
  </div>
);

// ─── Chart Tab ────────────────────────────────────────────────────────────────
type TrendMode = 'line-area' | 'stacked-bar';

// ─── Main Page ────────────────────────────────────────────────────────────────
export const GoNoGoStatisticsPage: React.FC = () => {
  const role = authService.getUserRole();
  if (role === 'ROLE_USER') {
    return <Navigate to="/dashboard" replace />;
  }

  const { summary, dailyTrend, defectBreakdown, floorStats, worstEquipments, loading, filter, setFilter, refresh } =
    useGoNoGoStats();

  const [trendMode, setTrendMode] = useState<TrendMode>('line-area');

  // ── Helpers ──
  const passRateBadge = (rate: number) =>
    rate >= 80 ? { label: `${rate}%`, variant: 'ok' as const } :
    rate >= 60 ? { label: `${rate}%`, variant: 'warn' as const } :
                 { label: `${rate}%`, variant: 'critical' as const };

  return (
    <div className="w-full pt-0.5 sm:pt-1 pb-6 sm:pb-space-xl font-body-md space-y-5 animate-in fade-in duration-200">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="border-b border-border-subtle pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-headline-xl text-text-primary">GO/NOGO Statistics</h1>
              <p className="text-xs text-text-secondary mt-0.5">Tổng hợp kết quả kiểm tra toàn hệ thống</p>
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* ── Filter Bar ─────────────────────────────────────────────────── */}
        <div className="mt-4 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-label-md text-text-muted uppercase tracking-wider">From</label>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => setFilter({ startDate: e.target.value })}
              onClick={(e) => e.currentTarget.showPicker?.()}
              className="px-3 py-1.5 text-sm bg-surface-card border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer hover:border-primary/60 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-label-md text-text-muted uppercase tracking-wider">To</label>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => setFilter({ endDate: e.target.value })}
              onClick={(e) => e.currentTarget.showPicker?.()}
              className="px-3 py-1.5 text-sm bg-surface-card border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer hover:border-primary/60 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted self-end pb-1.5">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters active</span>
          </div>
        </div>
      </div>

      {/* ── Loading skeleton ─────────────────────────────────────────────── */}
      {loading && !summary ? (
        <div className="flex justify-center items-center py-20">
          <span className="material-symbols-outlined text-primary text-[36px] animate-spin">progress_activity</span>
        </div>
      ) : (
        <>
          {/* ── Row 1: KPI Cards ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KpiCard
              title="Overall Pass Rate"
              value={summary ? `${summary.passRate}%` : '—'}
              subtitle={`${summary?.passCount ?? 0} PASS / ${summary?.totalAttempts ?? 0} total`}
              icon={<TrendingUp className="w-5 h-5" />}
              iconBg="bg-sky-500"
              badge={summary ? passRateBadge(summary.passRate) : undefined}
            />
            <KpiCard
              title="Total Attempts"
              value={summary?.totalAttempts.toLocaleString() ?? '—'}
              subtitle={`${summary?.passCount ?? 0} pass · ${summary?.failCount ?? 0} fail`}
              icon={<ClipboardCheck className="w-5 h-5" />}
              iconBg="bg-violet-500"
            />
            <KpiCard
              title="Equipments Tested"
              value={summary?.testedEquipmentCount ?? '—'}
              subtitle="In selected period"
              icon={<BarChart3 className="w-5 h-5" />}
              iconBg="bg-emerald-500"
            />
            <KpiCard
              title="Critical Equipments"
              value={summary?.criticalEquipmentCount ?? '—'}
              subtitle="With ≥1 failure"
              icon={<ShieldAlert className="w-5 h-5" />}
              iconBg={summary && summary.criticalEquipmentCount > 0 ? 'bg-red-500' : 'bg-slate-400'}
              badge={summary && summary.criticalEquipmentCount > 0 ? { label: 'Needs Attention', variant: 'critical' } : { label: 'All OK', variant: 'ok' }}
            />
          </div>

          {/* ── Row 2: Trend Chart + Defect Donut ───────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Trend Chart - 2/3 width */}
            <div className="lg:col-span-2 bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="font-headline-sm font-bold text-text-primary">Daily Test Trend</h2>
                  <p className="text-xs text-text-muted mt-0.5">Pass rate & attempt volume over time</p>
                </div>
                {/* Mode switcher */}
                <div className="flex bg-surface-subtle border border-border-subtle rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setTrendMode('line-area')}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${trendMode === 'line-area' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary hover:bg-surface-card'}`}
                  >
                    Trend
                  </button>
                  <button
                    onClick={() => setTrendMode('stacked-bar')}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${trendMode === 'stacked-bar' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary hover:bg-surface-card'}`}
                  >
                    Volume
                  </button>
                </div>
              </div>
              <div className="h-[260px] sm:h-[280px]">
                <PassRateTrendChart data={dailyTrend} mode={trendMode} />
              </div>
            </div>

            {/* Defect Donut - 1/3 width */}
            <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-4 sm:p-5">
              <h2 className="font-headline-sm font-bold text-text-primary mb-0.5">Defect Breakdown</h2>
              <p className="text-xs text-text-muted mb-3">Failure type distribution</p>
              <div className="h-[260px] sm:h-[280px]">
                {defectBreakdown ? (
                  <DefectDonutChart data={defectBreakdown} />
                ) : (
                  <div className="flex items-center justify-center h-full text-text-muted text-sm">No data</div>
                )}
              </div>
            </div>
          </div>

          {/* ── Row 3: Floor Comparison + Worst Equipments ──────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Floor Bar Chart - 2/5 width */}
            <div className="lg:col-span-2 bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-4 sm:p-5">
              <h2 className="font-headline-sm font-bold text-text-primary mb-0.5">Floor Performance</h2>
              <p className="text-xs text-text-muted mb-3">Pass rate comparison across floors</p>
              <div className="h-[220px]">
                <FloorComparisonChart data={floorStats} />
              </div>
            </div>

            {/* Worst Equipments Table - 3/5 width */}
            <div className="lg:col-span-3 bg-surface-card rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
              <div className="px-4 sm:px-5 py-4 border-b border-border-subtle flex items-center justify-between">
                <div>
                  <h2 className="font-headline-sm font-bold text-text-primary">Worst Performing Equipments</h2>
                  <p className="text-xs text-text-muted mt-0.5">Top {worstEquipments.length} by fail count — click to view analytics</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-red-50 text-red-600 rounded-full">
                  {worstEquipments.length} equipments
                </span>
              </div>
              <WorstEquipmentsTable data={worstEquipments} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GoNoGoStatisticsPage;
