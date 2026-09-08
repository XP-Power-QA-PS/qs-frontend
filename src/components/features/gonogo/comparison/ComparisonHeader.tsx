import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ComparisonHeaderProps {
  backUrl: string;
  equipmentName?: string;
  equipmentCode?: string;
  month?: string;
  year?: string;
  comparisonRangeLabel?: string;
}

export const ComparisonHeader: React.FC<ComparisonHeaderProps> = ({
  backUrl,
  equipmentName,
  equipmentCode,
  month,
  year,
  comparisonRangeLabel,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2.5 border-b border-border-subtle pb-3 sm:pb-4">
      {/* Back link & Breadcrumbs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigate(backUrl)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-secondary hover:text-text-primary text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Daily Details</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-text-muted">
          <span>Equipment</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>{equipmentName || 'Record'}</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">2-Day Comparison</span>
        </div>
      </div>

      {/* Title & Info Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2.5 bg-primary text-white rounded-xl shadow-xs shrink-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">compare_arrows</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-headline-xl text-text-primary tracking-tight">
                Daily Test Detailed Comparison
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary">
                Dedicated side-by-side visual comparison of test results, parameters, and history
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-1 text-xs sm:text-sm mt-2">
            {equipmentName && <span className="font-headline-sm font-bold text-text-primary">{equipmentName}</span>}
            {equipmentCode && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary font-technical-data font-semibold rounded-md border border-primary/20">
                {equipmentCode}
              </span>
            )}
            {(month || year) && (
              <>
                <span className="text-border-strong px-1">|</span>
                <span className="text-text-secondary">
                  Inspection Period: <strong className="text-text-primary font-semibold">Month {month}/{year}</strong>
                </span>
              </>
            )}
            {comparisonRangeLabel && (
              <>
                <span className="text-border-strong px-1">|</span>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-technical-data font-bold border border-primary/20">
                  {comparisonRangeLabel}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
