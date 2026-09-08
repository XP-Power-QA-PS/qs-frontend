import React from 'react';
import type { ComparisonInsightDTO } from '@/types/equipment';

interface ComparisonInsightsBannerProps {
  insights: ComparisonInsightDTO;
}

export const ComparisonInsightsBanner: React.FC<ComparisonInsightsBannerProps> = ({ insights }) => {
  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-surface-card p-4 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-2xs">
          <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
        </div>
        <div className="space-y-2.5 flex-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              Kết Luận &amp; Nhận Định Hệ Thống
            </h3>
            <p className="text-sm sm:text-base font-semibold text-text-primary leading-relaxed mt-0.5">
              {insights.summaryText}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold border inline-flex items-center gap-1.5 ${
                insights.sameTester
                  ? 'bg-status-nominal/15 text-status-nominal border-status-nominal/30'
                  : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {insights.sameTester ? 'verified' : 'group'}
              </span>
              {insights.sameTester ? 'Cùng kỹ thuật viên phụ trách' : 'Khác kỹ thuật viên phụ trách'}
            </span>

            <span className="px-3 py-1 rounded-lg font-technical-data text-xs font-bold bg-surface-card border border-border-subtle text-text-secondary">
              Chênh lệch tỷ lệ Đạt: {insights.passRateDifference}%
            </span>

            {insights.parameterDifferences && insights.parameterDifferences.length > 0 ? (
              insights.parameterDifferences.map((diff, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-status-critical/10 text-status-critical border border-status-critical/20 inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  {diff}
                </span>
              ))
            ) : (
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-status-nominal/10 text-status-nominal border border-status-nominal/20 inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Thông số kiểm tra đồng nhất
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
