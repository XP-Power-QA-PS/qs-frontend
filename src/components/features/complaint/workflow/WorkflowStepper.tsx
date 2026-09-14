import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import type { ComplaintDetail } from '@/types/complaint/complaint.types';
import { COMPLAINT_STAGE_META } from '@/types/complaint/complaint.types';

export interface WorkflowStep {
  num: number;
  name: string;
  key: string;
  sla: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { num: 1, name: 'Intake', key: 'RECEIVED', sla: '0d' },
  { num: 2, name: 'CFT Review', key: 'MEETING_SCHEDULED', sla: '1d' },
  { num: 3, name: 'Containment', key: 'CONTAINMENT_COMMITTED', sla: '2d' },
  { num: 4, name: 'Root Cause', key: 'ROOT_CAUSE_ANALYZED', sla: '5d' },
  { num: 5, name: 'CAPA Plan', key: 'CAPA_COMMITTED', sla: '10d' },
  { num: 6, name: 'Verification', key: 'EFFECTIVENESS_VERIFYING', sla: '30d' },
  { num: 7, name: 'Case Closure', key: 'CLOSED', sla: 'Finish' },
];

interface WorkflowStepperProps {
  complaint: ComplaintDetail;
  activeTab: 'info' | 'action' | 'meetings';
  activeWorkflowPhase: number;
  effectiveStepIndex: number;
  onSelectStep: (stepNum: number) => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  complaint,
  activeTab,
  activeWorkflowPhase,
  effectiveStepIndex,
  onSelectStep,
}) => {
  const stageMeta = COMPLAINT_STAGE_META[complaint.status];

  return (
    <div className="bg-white border border-border-subtle p-4 sm:p-5 rounded-2xl shadow-2xs">
      <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Jeanette Quality SLA Process Flow
        </span>
        <div className="flex items-center gap-2">
          <span className="text-text-muted font-normal text-[10px] sm:text-[11px] normal-case">
            Click any step to open corresponding tab & phase workflow
          </span>
          <span className="text-primary font-semibold lowercase text-xs">
            {stageMeta?.sla}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 relative">
        {WORKFLOW_STEPS.map((step, idx) => {
          const isCompleted = idx < effectiveStepIndex || complaint.status === 'CLOSED';
          const isCurrent = idx === effectiveStepIndex && complaint.status !== 'CLOSED';
          const isSelected =
            (step.num === 1 && activeTab === 'info') ||
            (step.num === 2 && (activeTab === 'meetings' || (activeTab === 'action' && activeWorkflowPhase === 2))) ||
            (activeTab === 'action' && activeWorkflowPhase === step.num);

          return (
            <div
              key={step.num}
              onClick={() => onSelectStep(step.num)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer hover:shadow-xs relative ${
                isSelected
                  ? complaint.status === 'CLOSED' || isCompleted
                    ? 'bg-emerald-100/90 border-emerald-500 ring-2 ring-emerald-500/80 shadow-xs'
                    : isCurrent
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500 shadow-xs'
                    : 'bg-primary/10 border-primary ring-2 ring-primary shadow-xs'
                  : isCompleted
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800 hover:bg-emerald-100/60'
                  : isCurrent
                  ? 'bg-amber-50/70 border-amber-300 text-amber-900 ring-1 ring-amber-400/50 hover:bg-amber-100/60'
                  : 'bg-surface-canvas border-border-subtle text-text-muted opacity-70 hover:opacity-100 hover:bg-surface-subtle'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span
                      className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        isCurrent
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-surface-subtle text-text-secondary'
                      }`}
                    >
                      {step.num}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <span
                    className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tighter ${
                      complaint.status === 'CLOSED' || isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-amber-600 text-white'
                        : 'bg-primary text-white'
                    }`}
                  >
                    Viewing
                  </span>
                )}
              </div>
              <div
                className={`text-[11px] font-semibold truncate ${
                  isSelected
                    ? complaint.status === 'CLOSED' || isCompleted
                      ? 'text-emerald-950 font-bold'
                      : isCurrent
                      ? 'text-amber-950 font-bold'
                      : 'text-primary font-bold'
                    : isCurrent
                    ? 'text-amber-900 font-bold'
                    : isCompleted
                    ? 'text-emerald-900'
                    : 'text-text-secondary'
                }`}
              >
                {step.name}
              </div>
              <div className="text-[9px] text-text-muted mt-0.5">SLA: {step.sla}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
