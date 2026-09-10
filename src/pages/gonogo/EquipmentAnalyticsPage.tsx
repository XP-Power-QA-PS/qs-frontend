import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Navigate } from 'react-router-dom';
import { ChevronLeft, BarChart3 } from 'lucide-react';
import { authService } from '@/services/auth';
import { statsService } from '@/services/equipment';
import type { EquipmentStatsDTO } from '@/types/equipment';
import { MonthlyTrendChart } from '@/components/features/gonogo/charts/MonthlyTrendChart';
import { DailyGroupedBarChart } from '@/components/features/gonogo/charts/DailyGroupedBarChart';
import { AttemptScatterPlot } from '@/components/features/gonogo/charts/AttemptScatterPlot';
import { DefectDonutChart } from '@/components/features/gonogo/charts/DefectDonutChart';
import toast from 'react-hot-toast';

// ─── Small KPI Card ────────────────────────────────────────────────────────────
interface MiniKpiProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

const MiniKpi: React.FC<MiniKpiProps> = ({ label, value, sub, accent }) => (
  <div className="bg-surface-card rounded-xl border border-border-subtle shadow-xs p-4">
    <p className="text-[10px] font-label-md text-text-muted uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-2xl font-bold font-technical-data ${accent ?? 'text-text-primary'}`}>{value}</p>
    {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
  </div>
);

// ─── Month Selector ───────────────────────────────────────────────────────────
interface MonthSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onChange: (month: number, year: number) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, selectedYear, onChange }) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const now = new Date();
  const currentYear = now.getFullYear();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onChange(selectedMonth, selectedYear - 1)}
        className="p-1.5 rounded-lg hover:bg-surface-subtle transition-colors text-text-muted hover:text-text-primary cursor-pointer"
        aria-label="Previous year"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm font-semibold text-text-primary w-12 text-center">{selectedYear}</span>
      <button
        onClick={() => onChange(selectedMonth, selectedYear + 1)}
        disabled={selectedYear >= currentYear}
        className="p-1.5 rounded-lg hover:bg-surface-subtle transition-colors text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer"
        aria-label="Next year"
      >
        <ChevronLeft className="w-4 h-4 rotate-180" />
      </button>
      {months.map((m, i) => {
        const mn = i + 1;
        const isSelected = mn === selectedMonth;
        const isFuture = selectedYear === currentYear && mn > now.getMonth() + 1;
        return (
          <button
            key={mn}
            onClick={() => !isFuture && onChange(mn, selectedYear)}
            disabled={isFuture}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
              isSelected
                ? 'bg-primary text-white shadow-xs'
                : isFuture
                ? 'text-text-muted/40 cursor-not-allowed'
                : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
            }`}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export const EquipmentAnalyticsPage: React.FC = () => {
  const role = authService.getUserRole();
  if (role === 'ROLE_USER') {
    return <Navigate to="/dashboard" replace />;
  }

  const { equipmentId } = useParams<{ equipmentId: string }>();
  const [searchParams] = useSearchParams();

  const equipmentCode = searchParams.get('code') || '';
  const equipmentName = searchParams.get('name') || '';

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [data, setData] = useState<EquipmentStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!equipmentId) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await statsService.getEquipmentStats(equipmentId, month, year);
        setData(result);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to load equipment analytics');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [equipmentId, month, year]);

  const handleMonthChange = (m: number, y: number) => {
    setMonth(m);
    setYear(y);
  };

  const summary = data?.summary;
  const passRateColor =
    !summary ? 'text-text-primary'
    : summary.passRate >= 80 ? 'text-status-ok'
    : summary.passRate >= 60 ? 'text-amber-500'
    : 'text-status-critical';

  return (
    <div className="w-full pt-0.5 sm:pt-1 pb-6 sm:pb-space-xl font-body-md space-y-5 animate-in fade-in duration-200">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="border-b border-border-subtle pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h1 className="text-xl sm:text-2xl font-bold font-headline-xl text-text-primary">
                {data?.equipmentName || equipmentName}
              </h1>
              <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-technical-data text-xs font-semibold rounded-lg border border-primary/20">
                {data?.equipmentCode || equipmentCode}
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Equipment Analytics — {data?.floorName ?? ''}
            </p>
          </div>
        </div>
      </div>

      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {loading && !data ? (
        <div className="flex justify-center items-center py-20">
          <span className="material-symbols-outlined text-primary text-[36px] animate-spin">progress_activity</span>
        </div>
      ) : (
        <>
          {/* ── Row 1: KPI Cards ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <MiniKpi
              label="Pass Rate"
              value={summary ? `${summary.passRate}%` : '—'}
              sub={`${month.toString().padStart(2, '0')}/${year}`}
              accent={passRateColor}
            />
            <MiniKpi
              label="Total Attempts"
              value={summary?.totalAttempts ?? '—'}
              sub={`${summary?.passCount ?? 0} pass · ${summary?.failCount ?? 0} fail`}
            />
            <MiniKpi
              label="Avg Attempts/Day"
              value={
                summary && data?.dailyBreakdown.length
                  ? `${Math.round((summary.totalAttempts / data.dailyBreakdown.length) * 10) / 10}`
                  : '—'
              }
              sub="Per test day"
            />
            <MiniKpi
              label="No-Go Failures"
              value={summary?.noGoFailCount ?? '—'}
              sub={summary?.noGoFailCount ? '⚠ Safety critical' : 'None recorded'}
              accent={summary && summary.noGoFailCount > 0 ? 'text-status-critical' : 'text-status-ok'}
            />
          </div>

          {/* ── Row 2: Monthly Trend + Defect Donut ─────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-4 sm:p-5">
              <h2 className="font-headline-sm font-bold text-text-primary mb-0.5">Pass Rate History by Month</h2>
              <p className="text-xs text-text-muted mb-3">Dots color: 🟢 ≥80% · 🟠 60–79% · 🔴 &lt;60%</p>
              <div className="h-[240px]">
                <MonthlyTrendChart data={data?.monthlyTrend ?? []} />
              </div>
            </div>
            <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-4 sm:p-5">
              <h2 className="font-headline-sm font-bold text-text-primary mb-0.5">Defect Breakdown</h2>
              <p className="text-xs text-text-muted mb-3">
                {`${month.toString().padStart(2, '0')}/${year}`} failure types
              </p>
              <div className="h-[240px]">
                {data?.defectBreakdown ? (
                  <DefectDonutChart data={data.defectBreakdown} />
                ) : (
                  <div className="flex items-center justify-center h-full text-text-muted text-sm">No data</div>
                )}
              </div>
            </div>
          </div>

          {/* ── Month Selector for Daily Charts ─────────────────────────── */}
          <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-4">
            <p className="text-xs font-label-md text-text-muted uppercase tracking-wider mb-3">Select month for daily charts</p>
            <MonthSelector selectedMonth={month} selectedYear={year} onChange={handleMonthChange} />
          </div>

          {/* ── Row 3: Daily Grouped Bar + Scatter Plot ──────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-4 sm:p-5">
              <h2 className="font-headline-sm font-bold text-text-primary mb-0.5">Daily PASS vs FAIL</h2>
              <p className="text-xs text-text-muted mb-3">
                {`${month.toString().padStart(2, '0')}/${year}`} — by test day
              </p>
              <div className="h-[220px]">
                <DailyGroupedBarChart data={data?.dailyBreakdown ?? []} />
              </div>
            </div>
            <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-4 sm:p-5">
              <h2 className="font-headline-sm font-bold text-text-primary mb-0.5">Repeat Attempt Analysis</h2>
              <p className="text-xs text-text-muted mb-3">
                🟢 All pass · 🔴 Has fail · Blue line = average
              </p>
              <div className="h-[220px]">
                <AttemptScatterPlot data={data?.dailyBreakdown ?? []} />
              </div>
            </div>
          </div>

          {/* ── Empty state for selected month ──────────────────────────── */}
          {!loading && data && data.dailyBreakdown.length === 0 && (
            <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-8 text-center">
              <span className="material-symbols-outlined text-[40px] text-border-strong">event_busy</span>
              <p className="text-sm font-medium text-text-primary mt-2">No tests recorded for {month.toString().padStart(2, '0')}/{year}</p>
              <p className="text-xs text-text-muted mt-1">Select a different month using the selector above.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EquipmentAnalyticsPage;
