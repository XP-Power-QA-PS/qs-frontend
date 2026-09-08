import React from 'react';
import type { EquipmentTestAttempt } from '@/types/equipment';

interface ComparisonAttemptItemProps {
  attempt: EquipmentTestAttempt;
  index: number;
}

export const ComparisonAttemptItem: React.FC<ComparisonAttemptItemProps> = ({ attempt, index }) => {
  const attPass = attempt.resultStatus === 'PASS';

  return (
    <div
      className={`p-3.5 rounded-xl border text-xs flex flex-col gap-2.5 transition-all shadow-2xs ${
        attPass
          ? 'bg-status-nominal/5 border-status-nominal/20'
          : 'bg-status-critical/5 border-status-critical/25'
      }`}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-surface-card border border-border-subtle flex items-center justify-center font-technical-data font-bold text-xs text-text-secondary">
            #{index + 1}
          </span>
          <span className="font-technical-data font-medium text-text-secondary">
            {new Date(attempt.attemptTime).toLocaleTimeString()}
          </span>
          <span className="text-text-muted">• Tech: {attempt.testerUsername}</span>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
            attPass ? 'bg-status-nominal text-white' : 'bg-status-critical text-white'
          }`}
        >
          {attempt.resultStatus}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-surface-card p-2.5 rounded-lg border border-border-subtle text-center text-xs">
        <div className="space-y-0.5">
          <span className="text-text-muted block text-[10px] uppercase font-bold">PROGRAM</span>
          <span
            className={`font-bold font-technical-data ${
              attempt.programStatus === 'PASS' ? 'text-status-nominal' : 'text-status-critical'
            }`}
          >
            {attempt.programStatus}
          </span>
        </div>
        <div className="space-y-0.5 border-x border-border-subtle">
          <span className="text-text-muted block text-[10px] uppercase font-bold">GO</span>
          <span
            className={`font-bold font-technical-data ${
              attempt.goStatus === 'PASS' ? 'text-status-nominal' : 'text-status-critical'
            }`}
          >
            {attempt.goStatus}
          </span>
        </div>
        <div className="space-y-0.5">
          <span className="text-text-muted block text-[10px] uppercase font-bold">NO GO</span>
          <span
            className={`font-bold font-technical-data ${
              attempt.noGoStatus === 'FAIL' ? 'text-status-nominal' : 'text-status-critical'
            }`}
          >
            {attempt.noGoStatus}
          </span>
        </div>
      </div>

      {attempt.remark && (
        <div className="p-2 bg-surface-card rounded-lg border border-border-subtle text-text-secondary italic text-xs">
          "{attempt.remark}"
        </div>
      )}
    </div>
  );
};
