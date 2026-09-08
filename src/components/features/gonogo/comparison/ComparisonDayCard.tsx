import React from 'react';
import type { DailySummaryDTO } from '@/types/equipment';
import { ComparisonAttemptItem } from './ComparisonAttemptItem';

interface ComparisonDayCardProps {
  day: DailySummaryDTO;
  dayLabel: string;
}

export const ComparisonDayCard: React.FC<ComparisonDayCardProps> = ({ day, dayLabel }) => {
  const isPass = day.overallStatus === 'ALL_PASS';
  const isFail = day.overallStatus === 'HAS_FAIL';

  return (
    <div className="bg-surface-card rounded-2xl border-2 border-border-subtle hover:border-primary/30 transition-all shadow-xs overflow-hidden flex flex-col">
      {/* Day Header Card */}
      <div className="p-4 sm:p-5 border-b border-border-subtle bg-surface-subtle/40 flex items-center justify-between flex-wrap gap-2.5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">calendar_today</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-text-muted">{dayLabel}</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-surface-card font-technical-data font-bold border border-border-subtle text-text-secondary">
                ID #{day.dailyTestId}
              </span>
            </div>
            <h2 className="font-headline-sm text-lg font-bold text-text-primary">{day.testDate}</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Technician: <strong className="text-text-primary">{day.latestTester || 'N/A'}</strong>
            </p>
          </div>
        </div>

        <span
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${
            isPass
              ? 'bg-status-nominal/15 text-status-nominal border-status-nominal/30'
              : isFail
              ? 'bg-status-critical/15 text-status-critical border-status-critical/30'
              : 'bg-surface-subtle text-text-muted border-border-subtle'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isPass ? 'check_circle' : isFail ? 'error' : 'help'}
          </span>
          <span>{isPass ? 'ALL PASS' : isFail ? 'HAS FAIL' : 'NOT TESTED'}</span>
        </span>
      </div>

      {/* Body Details */}
      <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-5 flex-1 min-w-0">
        {/* KPI Metric Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-surface-subtle/80 border border-border-subtle">
            <span className="block text-[11px] sm:text-xs text-text-secondary font-medium mb-1 truncate">Total Attempts</span>
            <span className="font-technical-data font-bold text-lg sm:text-2xl text-text-primary">
              {day.totalAttempts}
            </span>
          </div>
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-status-nominal/10 border border-status-nominal/20">
            <span className="block text-[11px] sm:text-xs text-status-nominal font-medium mb-1 truncate">Pass</span>
            <span className="font-technical-data font-bold text-lg sm:text-2xl text-status-nominal">
              {day.passCount}
            </span>
          </div>
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-status-critical/10 border border-status-critical/20">
            <span className="block text-[11px] sm:text-xs text-status-critical font-medium mb-1 truncate">Fail</span>
            <span className="font-technical-data font-bold text-lg sm:text-2xl text-status-critical">
              {day.failCount}
            </span>
          </div>
        </div>

        {/* Pass Rate Bar */}
        <div className="space-y-2 p-3.5 rounded-xl bg-surface-subtle/50 border border-border-subtle">
          <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
            <span className="text-text-secondary">Pass Rate:</span>
            <span
              className={`font-technical-data font-bold text-sm ${
                day.passRate === 100
                  ? 'text-status-nominal'
                  : day.passRate >= 50
                  ? 'text-primary'
                  : 'text-status-critical'
              }`}
            >
              {day.passRate}%
            </span>
          </div>
          <div className="w-full h-3 bg-surface-card rounded-full overflow-hidden border border-border-subtle">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                day.passRate === 100
                  ? 'bg-status-nominal'
                  : day.passRate >= 50
                  ? 'bg-primary'
                  : 'bg-status-critical'
              }`}
              style={{ width: `${day.passRate}%` }}
            />
          </div>
        </div>

        {/* Detailed Attempts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">history</span>
              <span>Test Attempts List</span>
            </h4>
            <span className="text-xs font-technical-data text-text-secondary font-semibold">
              {day.attempts.length} attempts
            </span>
          </div>

          {day.attempts.length === 0 ? (
            <div className="text-center py-8 px-4 bg-surface-subtle/30 rounded-xl border border-dashed border-border-subtle">
              <p className="text-xs text-text-muted italic">No test attempts recorded for this day</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {day.attempts.map((att, attIdx) => (
                <ComparisonAttemptItem
                  key={att.id || attIdx}
                  attempt={att}
                  index={attIdx}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
