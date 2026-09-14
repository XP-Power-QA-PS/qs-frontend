import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Save,
  RotateCcw,
  Check,
} from 'lucide-react';
import type { ComplaintDetail, ComplaintUpdateRequest } from '@/types/complaint/complaint.types';

interface Phase6EffectivenessProps {
  complaint: ComplaintDetail;
  effectivenessData: {
    effectivenessStatus: 'PENDING' | 'EFFECTIVE' | 'NOT_EFFECTIVE';
    effectivenessVerifiedDate: string;
    effectivenessVerifiedBy: string;
    effectivenessRemarks: string;
  };
  setEffectivenessData: React.Dispatch<
    React.SetStateAction<{
      effectivenessStatus: 'PENDING' | 'EFFECTIVE' | 'NOT_EFFECTIVE';
      effectivenessVerifiedDate: string;
      effectivenessVerifiedBy: string;
      effectivenessRemarks: string;
    }>
  >;
  capaData: {
    evidenceDocumentation: string;
  };
  setCapaData: React.Dispatch<
    React.SetStateAction<any>
  >;
  isUpdating: boolean;
  handleUpdatePhase: (
    data: ComplaintUpdateRequest,
    successMsg: string,
    nextPhase?: 2 | 3 | 4 | 5 | 6 | 7
  ) => Promise<void>;
  setShowReopenModal: (show: boolean) => void;
  setReopenTargetStatus: (status: string) => void;
}

export const Phase6Effectiveness: React.FC<Phase6EffectivenessProps> = ({
  complaint,
  effectivenessData,
  setEffectivenessData,
  capaData,
  setCapaData,
  isUpdating,
  handleUpdatePhase,
  setShowReopenModal,
  setReopenTargetStatus,
}) => {
  return (
    <>
      {/* Left Column: Context */}
      <div className="lg:col-span-5 bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
              6
            </span>
            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Phase 6: 30-Day Effectiveness Verification (D7)
              </h4>
              <span className="text-[11px] text-teal-800 font-semibold">SLA: 30-Day Monitoring Period</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
            8D - Step D7
          </span>
        </div>

        {/* Evidence from Phase 5 */}
        <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-xl text-xs space-y-1.5 text-teal-950">
          <strong className="font-bold flex items-center gap-1.5 text-teal-900">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            Active CAPA Plan Under Monitoring:
          </strong>
          <p className="bg-white p-2.5 rounded-lg border border-teal-200 text-[11px] text-text-primary whitespace-pre-wrap">
            {complaint.correctivePreventiveAction || 'CAPA implementation in progress'}
          </p>
          <p className="text-[11px] text-teal-800 pt-1">
            Owner: <strong>{complaint.actionOwner || 'N/A'}</strong> (Due: {complaint.actionDueDate || 'Not set'})
          </p>
        </div>

        <div className="p-3.5 bg-surface-canvas rounded-xl text-xs space-y-1.5 border border-border-subtle">
          <strong className="text-text-primary block text-[11px]">IATF Step D7 Verification Criteria:</strong>
          <p className="text-text-secondary text-[11px] leading-relaxed">
            Continuously monitor subsequent production runs over at least 30 days. Ensure defect rate (PPM) = 0 with zero recurrence of the defect symptom.
          </p>
        </div>
      </div>

      {/* Right Column: Execution Form */}
      <div className="lg:col-span-7 bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            30-Day Effectiveness Verification & Audit Sign-off
          </h4>
          <span className="text-[11px] font-semibold text-teal-700">
            {effectivenessData.effectivenessStatus === 'EFFECTIVE'
              ? 'Effectiveness Confirmed'
              : effectivenessData.effectivenessStatus === 'NOT_EFFECTIVE'
              ? 'Defect Recurring'
              : 'Monitoring Active'}
          </span>
        </div>

        {/* Effectiveness Status Selector (3-way) */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
            Effectiveness Evaluation Result (30-Day Audit Criterion) <span className="text-rose-500">*</span>:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              disabled={complaint.status === 'CLOSED'}
              onClick={() => setEffectivenessData((prev) => ({ ...prev, effectivenessStatus: 'PENDING' }))}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                effectivenessData.effectivenessStatus === 'PENDING'
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20 shadow-2xs'
                  : 'bg-surface-canvas border-border-subtle hover:bg-surface-subtle'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <strong className="text-xs text-amber-900">PENDING</strong>
              </div>
              <p className="text-[10px] text-text-muted">
                30-day observation period actively running. Batches under monitoring.
              </p>
            </button>

            <button
              type="button"
              disabled={complaint.status === 'CLOSED'}
              onClick={() => setEffectivenessData((prev) => ({ ...prev, effectivenessStatus: 'EFFECTIVE' }))}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                effectivenessData.effectivenessStatus === 'EFFECTIVE'
                  ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20 shadow-2xs'
                  : 'bg-surface-canvas border-border-subtle hover:bg-surface-subtle'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <strong className="text-xs text-emerald-900">EFFECTIVE</strong>
              </div>
              <p className="text-[10px] text-text-muted">
                Zero defect recurrence over 30 days. Standard criteria achieved.
              </p>
            </button>

            <button
              type="button"
              disabled={complaint.status === 'CLOSED'}
              onClick={() => setEffectivenessData((prev) => ({ ...prev, effectivenessStatus: 'NOT_EFFECTIVE' }))}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                effectivenessData.effectivenessStatus === 'NOT_EFFECTIVE'
                  ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-500/20 shadow-2xs'
                  : 'bg-surface-canvas border-border-subtle hover:bg-surface-subtle'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <strong className="text-xs text-rose-900">NOT EFFECTIVE</strong>
              </div>
              <p className="text-[10px] text-text-muted">
                Defect recurred or persisted. Requires reopening investigation.
              </p>
            </button>
          </div>
        </div>

        {/* Verification Details: Auditor & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Verification Audit Date:
            </label>
            <input
              type="date"
              disabled={complaint.status === 'CLOSED'}
              value={effectivenessData.effectivenessVerifiedDate}
              onChange={(e) => setEffectivenessData((prev) => ({ ...prev, effectivenessVerifiedDate: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Verified By (Auditor / CQE):
            </label>
            <input
              type="text"
              disabled={complaint.status === 'CLOSED'}
              value={effectivenessData.effectivenessVerifiedBy}
              onChange={(e) => setEffectivenessData((prev) => ({ ...prev, effectivenessVerifiedBy: e.target.value }))}
              placeholder="e.g., CQE Lead / Customer Quality Auditor"
              className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            Effectiveness Remarks & Audit Findings:
          </label>
          <textarea
            rows={3}
            disabled={complaint.status === 'CLOSED'}
            value={effectivenessData.effectivenessRemarks}
            onChange={(e) => setEffectivenessData((prev) => ({ ...prev, effectivenessRemarks: e.target.value }))}
            placeholder="e.g., Checked 4 consecutive production lots (Batch #101, #102, #103, #104), sample size 315 pcs each: 0 defects detected. Customer confirmation email received on 14/09..."
            className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary disabled:opacity-60 disabled:cursor-not-allowed font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            30-Day Evidence Documentation (Reports, Audit Logs, URLs):
          </label>
          <input
            type="text"
            disabled={complaint.status === 'CLOSED'}
            value={capaData.evidenceDocumentation}
            onChange={(e) => setCapaData((prev: any) => ({ ...prev, evidenceDocumentation: e.target.value }))}
            placeholder="e.g., OQC Inspection Report #OQC-2026-088; Link: https://sharepoint/.../report.pdf"
            className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary disabled:opacity-60 disabled:cursor-not-allowed font-sans"
          />
        </div>

        {/* Alert notification based on selected status */}
        {effectivenessData.effectivenessStatus === 'NOT_EFFECTIVE' && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1 text-rose-950">
            <strong className="font-bold flex items-center gap-1.5 text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              CAPA Evaluation: Not Effective (Defect Recurring)
            </strong>
            <p className="text-[11px] text-rose-900 leading-relaxed">
              According to 8D methodology, when a corrective action fails to eliminate the root cause, the complaint ticket must be reopened for re-investigating the root cause and defining additional preventive controls.
            </p>
          </div>
        )}

        {effectivenessData.effectivenessStatus === 'EFFECTIVE' && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-950">
            <strong className="font-bold flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              CAPA Evaluation: Confirmed Effective
            </strong>
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              Zero defects verified across 30 days of production runs. All effectiveness criteria have been satisfied. You may now proceed to Phase 7 for formal closure sign-off.
            </p>
          </div>
        )}

        {/* Dual Gate Action Buttons or Closed Read-Only Notice */}
        {complaint.status === 'CLOSED' ? (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-emerald-900 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Case is closed and archived in read-only mode.</span>
            </div>
            <button
              type="button"
              onClick={() => setShowReopenModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-amber-800 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 cursor-pointer shadow-2xs shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              Request Ticket Reopen
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-border-subtle">
            {effectivenessData.effectivenessStatus === 'NOT_EFFECTIVE' ? (
              <>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => {
                    handleUpdatePhase(
                      {
                        effectivenessStatus: 'NOT_EFFECTIVE',
                        effectivenessVerifiedDate: effectivenessData.effectivenessVerifiedDate || undefined,
                        effectivenessVerifiedBy: effectivenessData.effectivenessVerifiedBy || undefined,
                        effectivenessRemarks: effectivenessData.effectivenessRemarks || undefined,
                        actionStatus: `NOT_EFFECTIVE | [Evidence: ${capaData.evidenceDocumentation || 'Audit log'}]`,
                        status: 'EFFECTIVENESS_VERIFYING',
                      },
                      'Effectiveness audit recorded as NOT EFFECTIVE.'
                    );
                  }}
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border-subtle hover:bg-surface-canvas text-text-secondary text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4 text-text-muted" />
                  Save Record (Not Effective)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReopenTargetStatus('ROOT_CAUSE_ANALYZED');
                    setShowReopenModal(true);
                  }}
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reopen Case for Root Cause Re-evaluation &rarr;
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => {
                    handleUpdatePhase(
                      {
                        effectivenessStatus: effectivenessData.effectivenessStatus,
                        effectivenessVerifiedDate: effectivenessData.effectivenessVerifiedDate || undefined,
                        effectivenessVerifiedBy: effectivenessData.effectivenessVerifiedBy || undefined,
                        effectivenessRemarks: effectivenessData.effectivenessRemarks || undefined,
                        actionStatus: [
                          effectivenessData.effectivenessStatus,
                          capaData.evidenceDocumentation ? `[Evidence: ${capaData.evidenceDocumentation}]` : '',
                        ].filter(Boolean).join(' | '),
                        status: 'EFFECTIVENESS_VERIFYING',
                      },
                      'Effectiveness verification progress saved successfully!'
                    );
                  }}
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border-subtle hover:bg-surface-canvas text-text-secondary text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4 text-text-muted" />
                  Save Monitoring Progress
                </button>

                <button
                  type="button"
                  disabled={isUpdating || effectivenessData.effectivenessStatus !== 'EFFECTIVE'}
                  onClick={() => {
                    handleUpdatePhase(
                      {
                        effectivenessStatus: 'EFFECTIVE',
                        effectivenessVerifiedDate: effectivenessData.effectivenessVerifiedDate || new Date().toISOString().slice(0, 10),
                        effectivenessVerifiedBy: effectivenessData.effectivenessVerifiedBy || undefined,
                        effectivenessRemarks: effectivenessData.effectivenessRemarks || undefined,
                        actionStatus: [
                          'VERIFIED_OK',
                          capaData.evidenceDocumentation ? `[Evidence: ${capaData.evidenceDocumentation.trim()}]` : '',
                        ].filter(Boolean).join(' | '),
                        status: 'EFFECTIVENESS_VERIFYING',
                      },
                      'Effectiveness confirmed! Phase 7 (Case Closure) activated.',
                      7
                    );
                  }}
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Confirm Effectiveness & Proceed to Phase 7 &rarr;
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};
