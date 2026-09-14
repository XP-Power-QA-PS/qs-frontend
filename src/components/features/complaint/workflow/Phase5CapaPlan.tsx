import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  CheckSquare,
  Save,
  RotateCcw,
} from 'lucide-react';
import type { ComplaintDetail, ComplaintUpdateRequest } from '@/types/complaint/complaint.types';

export interface Phase5CapaPlanProps {
  complaint: ComplaintDetail;
  isUpdating: boolean;
  handleUpdatePhase: (
    data: ComplaintUpdateRequest,
    successMsg: string,
    nextPhase?: 2 | 3 | 4 | 5 | 6 | 7
  ) => Promise<void>;
  onReopenCase?: () => void;
}

export const Phase5CapaPlan: React.FC<Phase5CapaPlanProps> = ({
  complaint,
  isUpdating,
  handleUpdatePhase,
  onReopenCase,
}) => {
  const parseInitialCapa = () => {
    let cAction = complaint.correctiveAction || '';
    let pAction = complaint.preventiveAction || '';
    if (!cAction && !pAction && complaint.correctivePreventiveAction) {
      const raw = complaint.correctivePreventiveAction;
      if (raw.includes('[Corrective') || raw.includes('[Preventive') || raw.includes('[Khắc phục') || raw.includes('[Phòng ngừa')) {
        const parts = raw.split(/\[(?:Preventive|Phòng ngừa)[^\]]*\]:/);
        if (parts[0]) {
          cAction = parts[0].replace(/\[(?:Corrective|Khắc phục)[^\]]*\]:/, '').trim();
        }
        if (parts[1]) {
          pAction = parts[1].trim();
        }
      } else {
        cAction = raw;
      }
    }

    let parsedActionStatus = complaint.actionStatus || 'OPEN';
    let parsedEvidence = '';
    if (complaint.actionStatus && (complaint.actionStatus.includes('[Evidence:') || complaint.actionStatus.includes('[Minh chứng:'))) {
      const match = complaint.actionStatus.match(/^(.*?)\s*\|\s*\[(?:Evidence|Minh chứng):\s*(.*?)\]$/);
      if (match) {
        parsedActionStatus = match[1].trim();
        parsedEvidence = match[2].trim();
      } else {
        const parts = complaint.actionStatus.split(/\|\s*\[(?:Evidence|Minh chứng):\s*/);
        parsedActionStatus = parts[0].trim();
        if (parts[1]) {
          parsedEvidence = parts[1].replace(/\]$/, '').trim();
        }
      }
    }

    return {
      correctivePreventiveAction: complaint.correctivePreventiveAction || '',
      correctiveAction: cAction,
      preventiveAction: pAction,
      actionOwner: complaint.actionOwner || '',
      actionDueDate: complaint.actionDueDate || '',
      actionStatus: parsedActionStatus,
      capaCompletionDate: complaint.capaCompletionDate || '',
      evidenceDocumentation: parsedEvidence,
    };
  };

  const [capaData, setCapaData] = useState(parseInitialCapa);

  useEffect(() => {
    setCapaData(parseInitialCapa());
  }, [complaint]);
  return (
    <>
      {/* Left Column: Context */}
      <div className="lg:col-span-5 bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
              5
            </span>
            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Phase 5: Corrective & Preventive Actions (D5-D6)
              </h4>
              <span className="text-[11px] text-purple-800 font-semibold">SLA: 10 Business Days</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            8D - Steps D5 & D6
          </span>
        </div>

        {/* Official CAPA Number Badge */}
        {complaint.capaNo ? (
          <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                Official CAPA Number
              </span>
              <span className="text-base font-extrabold font-mono text-purple-950">
                {complaint.capaNo}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-200/80 text-purple-900 border border-purple-300">
              Assigned & Active
            </span>
          </div>
        ) : (
          <div className="p-3 bg-purple-50/70 border border-purple-200/70 rounded-xl flex items-center gap-2.5 text-purple-900 text-xs">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="text-[11px] leading-relaxed">
              CAPA No. will be sequentially generated (e.g. <strong>CAPA-{new Date().getFullYear()}-001</strong>) upon saving or committing this phase.
            </span>
          </div>
        )}

        {/* Evidence from Phase 4 */}
        <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl text-xs space-y-1.5 text-purple-950">
          <strong className="font-bold flex items-center gap-1.5 text-purple-900">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            Approved Root Cause (D4 Baseline):
          </strong>
          <p className="bg-white p-2.5 rounded-lg border border-purple-200 text-[11px] text-text-primary whitespace-pre-wrap">
            {complaint.rootCause || 'Root cause analyzed'}
          </p>
          {complaint.rootCauseCategory && (
            <div className="pt-1 text-[11px] text-purple-800 flex items-center gap-2">
              <span>Category: <strong>{complaint.rootCauseCategory}</strong></span>
              {complaint.rootCauseOwner && <span>• Owner: <strong>{complaint.rootCauseOwner}</strong></span>}
            </div>
          )}
        </div>

        <div className="p-3.5 bg-surface-canvas rounded-xl text-xs space-y-1.5 border border-border-subtle">
          <strong className="text-text-primary block text-[11px]">IATF 16949 CAPA Effectiveness Criteria:</strong>
          <ul className="list-disc pl-4 text-text-secondary text-[11px] space-y-1">
            <li><strong>Corrective:</strong> Eliminate root cause of occurrence and escape mechanism.</li>
            <li><strong>Preventive:</strong> Horizontal rollout (Yokoten) to other models, tools, and lines.</li>
            <li>Specific Action Owner and committed target Due Date must be assigned.</li>
          </ul>
        </div>
      </div>

      {/* Right Column: Execution Form */}
      <div className="lg:col-span-7 bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-purple-600" />
            CAPA Plan Commitment & Execution
          </h4>
          <span className="text-[11px] font-semibold text-purple-700">
            {complaint.correctivePreventiveAction ? 'CAPA Committed' : 'Pending'}
          </span>
        </div>

        {/* 2-Branch Inputs: Corrective vs Preventive */}
        <div className="space-y-3 p-3.5 bg-surface-canvas rounded-xl border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
              2-Branch CAPA Structure (IATF 16949 Compliant):
            </span>
            {complaint.status !== 'CLOSED' && (capaData.correctiveAction || capaData.preventiveAction) && (
              <button
                type="button"
                onClick={() => {
                  const combined = [
                    capaData.correctiveAction ? `[Corrective]: ${capaData.correctiveAction}` : '',
                    capaData.preventiveAction ? `[Preventive]: ${capaData.preventiveAction}` : '',
                  ].filter(Boolean).join('\n\n');
                  setCapaData((prev) => ({ ...prev, correctivePreventiveAction: combined }));
                }}
                className="text-[11px] text-purple-700 hover:text-purple-900 font-bold underline cursor-pointer"
              >
                Merge both branches into CAPA Plan &rarr;
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Branch 1: Corrective */}
            <div className="space-y-1 bg-white p-3 rounded-lg border border-border-subtle">
              <label className="block text-[11px] font-bold text-purple-900">
                1. Direct Corrective Action (Eliminate Occurrence):
              </label>
              <span className="text-[10px] text-text-muted block">
                Eliminate root cause, rework affected batch, replace defective parts.
              </span>
              <textarea
                rows={3}
                disabled={complaint.status === 'CLOSED'}
                value={capaData.correctiveAction}
                onChange={(e) => {
                  const val = e.target.value;
                  setCapaData((prev) => {
                    const next = { ...prev, correctiveAction: val };
                    if (!prev.correctivePreventiveAction.includes('[Preventive') && !prev.correctivePreventiveAction.includes('[Phòng ngừa') && !prev.preventiveAction) {
                      next.correctivePreventiveAction = val;
                    }
                    return next;
                  });
                }}
                placeholder="e.g., Rework affected products and replace the incorrectly installed bearings..."
                className="w-full px-2.5 py-1.5 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:ring-1 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed font-sans"
              />
            </div>

            {/* Branch 2: Preventive / Yokoten */}
            <div className="space-y-1 bg-white p-3 rounded-lg border border-border-subtle">
              <label className="block text-[11px] font-bold text-indigo-900">
                2. Preventive & Yokoten Action (Systemic & Horizontal):
              </label>
              <span className="text-[10px] text-text-muted block">
                Systemic improvements: update assembly instruction, retrain operators, deploy Yokoten.
              </span>
              <textarea
                rows={3}
                disabled={complaint.status === 'CLOSED'}
                value={capaData.preventiveAction}
                onChange={(e) => setCapaData((prev) => ({ ...prev, preventiveAction: e.target.value }))}
                placeholder="e.g., Update assembly work instruction and retrain assembly line operators..."
                className="w-full px-2.5 py-1.5 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed font-sans"
              />
            </div>
          </div>
        </div>

        {/* Synthesized Textarea */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            Comprehensive CAPA Action Plan Summary <span className="text-rose-500">*</span>:
          </label>
          <textarea
            rows={3}
            disabled={complaint.status === 'CLOSED'}
            value={capaData.correctivePreventiveAction}
            onChange={(e) => setCapaData((prev) => ({ ...prev, correctivePreventiveAction: e.target.value }))}
            placeholder="e.g., Replace thermocouple with anti-oxidation probe; implement automated optical inspection (AOI) check..."
            className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-sans disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        {/* 4-Field Grid: Owner, Due Date, Actual Completion Date, Implementation Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Action Owner:
            </label>
            <input
              type="text"
              disabled={complaint.status === 'CLOSED'}
              value={capaData.actionOwner}
              onChange={(e) => setCapaData((prev) => ({ ...prev, actionOwner: e.target.value }))}
              placeholder="e.g., John Doe (PE)"
              className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Target Due Date:
            </label>
            <input
              type="date"
              disabled={complaint.status === 'CLOSED'}
              value={capaData.actionDueDate}
              onChange={(e) => setCapaData((prev) => ({ ...prev, actionDueDate: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Actual Completion Date:
            </label>
            <input
              type="date"
              disabled={complaint.status === 'CLOSED'}
              value={capaData.capaCompletionDate}
              onChange={(e) => setCapaData((prev) => ({ ...prev, capaCompletionDate: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Execution Status:
            </label>
            <select
              disabled={complaint.status === 'CLOSED'}
              value={capaData.actionStatus || 'OPEN'}
              onChange={(e) => setCapaData((prev) => ({ ...prev, actionStatus: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="OPEN">OPEN (Chờ triển khai)</option>
              <option value="IN_PROGRESS">IN_PROGRESS (Đang thực hiện)</option>
              <option value="COMPLETED">COMPLETED (Đã hoàn thành)</option>
            </select>
          </div>
        </div>

        {/* Dual Gate Action Buttons or Closed Read-Only Notice */}
        {complaint.status === 'CLOSED' ? (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-emerald-900 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Case is closed and archived in read-only mode.</span>
            </div>
            <button
              type="button"
              onClick={() => onReopenCase?.()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-amber-800 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 cursor-pointer shadow-2xs shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              Request Ticket Reopen
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-border-subtle">
            <button
              type="button"
              disabled={isUpdating || !capaData.correctivePreventiveAction.trim()}
              onClick={() =>
                handleUpdatePhase(
                  {
                    correctiveAction: capaData.correctiveAction || undefined,
                    preventiveAction: capaData.preventiveAction || undefined,
                    correctivePreventiveAction: capaData.correctivePreventiveAction,
                    actionOwner: capaData.actionOwner || undefined,
                    actionDueDate: capaData.actionDueDate || undefined,
                    capaCompletionDate: capaData.capaCompletionDate || undefined,
                    actionStatus: capaData.actionStatus || 'IN_PROGRESS',
                    status: 'CAPA_COMMITTED',
                  },
                  'CAPA action plan saved successfully!'
                )
              }
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border-subtle hover:bg-surface-canvas text-text-secondary text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-text-muted" />
              Save CAPA Plan
            </button>

            <button
              type="button"
              disabled={isUpdating || !capaData.correctivePreventiveAction.trim()}
              onClick={() => {
                handleUpdatePhase(
                  {
                    correctiveAction: capaData.correctiveAction || undefined,
                    preventiveAction: capaData.preventiveAction || undefined,
                    correctivePreventiveAction: capaData.correctivePreventiveAction,
                    actionOwner: capaData.actionOwner || undefined,
                    actionDueDate: capaData.actionDueDate || undefined,
                    capaCompletionDate: capaData.capaCompletionDate || new Date().toISOString().slice(0, 10),
                    actionStatus: 'COMPLETED',
                    status: 'EFFECTIVENESS_VERIFYING',
                  },
                  'CAPA plan committed! Phase 6 (30-day Effectiveness Verification) initiated.',
                  6
                );
              }}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Commit CAPA & Proceed to Phase 6 &rarr;
            </button>
          </div>
        )}
      </div>
    </>
  );
};
