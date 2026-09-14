import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Save,
  RotateCcw,
  Check,
} from 'lucide-react';
import type { ComplaintDetail, ComplaintUpdateRequest } from '@/types/complaint/complaint.types';

export interface Phase6EffectivenessProps {
  complaint: ComplaintDetail;
  isUpdating: boolean;
  handleUpdatePhase: (
    data: ComplaintUpdateRequest,
    successMsg: string,
    nextPhase?: 2 | 3 | 4 | 5 | 6 | 7
  ) => Promise<void>;
  onReopenCase?: (targetStatus?: string) => void;
}

const parseEvidenceFromActionStatus = (actionStatus?: string): string => {
  if (!actionStatus) return '';
  const match = actionStatus.match(/\[(?:Evidence|Minh chứng):\s*(.*?)\]/);
  return match ? match[1].trim() : '';
};

export const Phase6Effectiveness: React.FC<Phase6EffectivenessProps> = ({
  complaint,
  isUpdating,
  handleUpdatePhase,
  onReopenCase,
}) => {
  const [effectivenessData, setEffectivenessData] = useState<{
    effectivenessStatus: 'PENDING' | 'EFFECTIVE' | 'NOT_EFFECTIVE';
    effectivenessVerifiedDate: string;
    effectivenessVerifiedBy: string;
    effectivenessRemarks: string;
  }>({
    effectivenessStatus: (complaint.effectivenessStatus as any) || 'PENDING',
    effectivenessVerifiedDate: complaint.effectivenessVerifiedDate || '',
    effectivenessVerifiedBy: complaint.effectivenessVerifiedBy || '',
    effectivenessRemarks: complaint.effectivenessRemarks || '',
  });

  const [evidenceDocumentation, setEvidenceDocumentation] = useState<string>(() =>
    parseEvidenceFromActionStatus(complaint.actionStatus)
  );

  useEffect(() => {
    setEffectivenessData({
      effectivenessStatus: (complaint.effectivenessStatus as any) || 'PENDING',
      effectivenessVerifiedDate: complaint.effectivenessVerifiedDate || '',
      effectivenessVerifiedBy: complaint.effectivenessVerifiedBy || '',
      effectivenessRemarks: complaint.effectivenessRemarks || '',
    });
    setEvidenceDocumentation(parseEvidenceFromActionStatus(complaint.actionStatus));
  }, [complaint]);

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
              <span className="text-[11px] text-teal-800 font-semibold">SLA: 30 Calendar Days</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
            8D - Step D7
          </span>
        </div>

        <div className="p-3.5 bg-surface-canvas rounded-xl text-xs space-y-2 border border-border-subtle">
          <strong className="text-text-primary block">Verification Methodology (Jeanette 7-Step):</strong>
          <p className="text-text-secondary leading-relaxed text-[11px]">
            Follow-up period: <strong>30 calendar days</strong> after CAPA execution.
          </p>
          <ul className="list-disc pl-4 text-text-secondary text-[11px] space-y-1">
            <li>Verify zero defect recurrence in mass production lots.</li>
            <li>Perform line audit & operator adherence check.</li>
            <li>If verified effective &rarr; Proceed to <strong>Phase 7 (Sign-off & Closure)</strong>.</li>
            <li>If defect recurs &rarr; <strong>Reopen Ticket</strong> to Phase 4 for root cause re-investigation.</li>
          </ul>
        </div>

        {/* Inherited CAPA Summary */}
        <div className="p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-xl text-xs space-y-2 text-purple-950">
          <strong className="block font-bold text-purple-900">Active CAPA Implementation Under Verification:</strong>
          <div className="space-y-1 text-[11px]">
            <div>
              <span className="text-purple-800 font-semibold">Owner / Due Date: </span>
              <strong>{complaint.actionOwner || 'N/A'}</strong> (Due: {complaint.actionDueDate || 'N/A'})
            </div>
            {complaint.correctivePreventiveAction && (
              <p className="bg-white/80 p-2 rounded-lg border border-purple-200 text-text-primary font-mono text-[10px] whitespace-pre-wrap">
                {complaint.correctivePreventiveAction}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Execution Form */}
      <div className="lg:col-span-7 bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            Verification Audit & PPM Results (30-Day Checkpoint)
          </h4>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            effectivenessData.effectivenessStatus === 'EFFECTIVE'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : effectivenessData.effectivenessStatus === 'NOT_EFFECTIVE'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {effectivenessData.effectivenessStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Effectiveness Status <span className="text-rose-500">*</span>:
            </label>
            <select
              disabled={complaint.status === 'CLOSED'}
              value={effectivenessData.effectivenessStatus}
              onChange={(e) =>
                setEffectivenessData((prev) => ({
                  ...prev,
                  effectivenessStatus: e.target.value as any,
                }))
              }
              className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="PENDING">🟡 PENDING (Monitoring In Progress)</option>
              <option value="EFFECTIVE">🟢 EFFECTIVE (Zero Recurrence - Approved)</option>
              <option value="NOT_EFFECTIVE">🔴 NOT EFFECTIVE (Defect Recurring)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Verified Date:
            </label>
            <input
              type="date"
              disabled={complaint.status === 'CLOSED'}
              value={effectivenessData.effectivenessVerifiedDate}
              onChange={(e) =>
                setEffectivenessData((prev) => ({ ...prev, effectivenessVerifiedDate: e.target.value }))
              }
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
              onChange={(e) =>
                setEffectivenessData((prev) => ({ ...prev, effectivenessVerifiedBy: e.target.value }))
              }
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
            onChange={(e) =>
              setEffectivenessData((prev) => ({ ...prev, effectivenessRemarks: e.target.value }))
            }
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
            value={evidenceDocumentation}
            onChange={(e) => setEvidenceDocumentation(e.target.value)}
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
            {onReopenCase && (
              <button
                type="button"
                onClick={() => onReopenCase()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-amber-800 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 cursor-pointer shadow-2xs shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                Request Ticket Reopen
              </button>
            )}
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
                        actionStatus: `NOT_EFFECTIVE | [Evidence: ${evidenceDocumentation || 'Audit log'}]`,
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

                {onReopenCase && (
                  <button
                    type="button"
                    onClick={() => onReopenCase('ROOT_CAUSE_ANALYZED')}
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reopen Case for Root Cause Re-evaluation &rarr;
                  </button>
                )}
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
                          evidenceDocumentation ? `[Evidence: ${evidenceDocumentation}]` : '',
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
                          evidenceDocumentation ? `[Evidence: ${evidenceDocumentation.trim()}]` : '',
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
