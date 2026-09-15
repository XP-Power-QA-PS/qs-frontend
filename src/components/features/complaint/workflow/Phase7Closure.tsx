import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import type { ComplaintDetail, ComplaintUpdateRequest } from '@/types/complaint/complaint.types';
import { FileUpload } from '@/components/common/FileUpload';

export interface Phase7ClosureProps {
  complaint: ComplaintDetail;
  isUpdating: boolean;
  handleUpdatePhase: (
    data: ComplaintUpdateRequest,
    successMsg: string
  ) => Promise<void>;
  onReopenCase?: () => void;
}

export const Phase7Closure: React.FC<Phase7ClosureProps> = ({
  complaint,
  isUpdating,
  handleUpdatePhase,
  onReopenCase,
}) => {
  const [finalEvidenceTmpKey, setFinalEvidenceTmpKey] = useState<string | null>(null);
  const [closureData, setClosureData] = useState({
    closureDate: complaint.closureDate || new Date().toISOString().slice(0, 10),
    finalStatus: complaint.finalStatus || 'ACCEPTED',
    finalEvidence: complaint.finalEvidence || '',
    remarks: complaint.remarks || '',
  });

  useEffect(() => {
    setClosureData({
      closureDate: complaint.closureDate || new Date().toISOString().slice(0, 10),
      finalStatus: complaint.finalStatus || 'ACCEPTED',
      finalEvidence: complaint.finalEvidence || '',
      remarks: complaint.remarks || '',
    });
  }, [complaint]);

  return (
    <>
      {/* Left Column: Context */}
      <div className="lg:col-span-5 bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              7
            </span>
            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Phase 7: Final Sign-off & Closure (D8)
              </h4>
              <span className="text-[11px] text-emerald-800 font-semibold">8D / CAPA Process Complete</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            8D - Step D8
          </span>
        </div>

        <div className="p-3.5 bg-surface-canvas rounded-xl text-xs space-y-2 border border-border-subtle">
          <strong className="text-text-primary block">IATF 16949 Sign-off Criteria (Step D8):</strong>
          <p className="text-text-secondary leading-relaxed text-[11px]">
            Final closure requires formal CFT quality endorsement confirming:
          </p>
          <ul className="list-disc pl-4 text-text-secondary text-[11px] space-y-1">
            <li>Interim containment actions safely decommissioned.</li>
            <li>Permanent corrective actions fully standardized (SOP / WI updated).</li>
            <li>Lesson learned shared with cross-functional manufacturing lines.</li>
            <li>Customer formal sign-off / acceptance received.</li>
          </ul>
        </div>

        {/* 8D Traceability Chain Summary */}
        <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs space-y-2 text-emerald-950">
          <strong className="block font-bold text-emerald-900">8D Gate Traceability Summary:</strong>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between py-0.5 border-b border-border-subtle">
              <span className="text-text-muted">Containment (D3):</span>
              <strong className="text-emerald-700">{complaint.containmentStatus || 'Complete'}</strong>
            </div>
            <div className="flex justify-between py-0.5 border-b border-border-subtle">
              <span className="text-text-muted">Root Cause (D4):</span>
              <strong className="text-emerald-700">{complaint.rootCause ? 'Identified' : 'Pending'}</strong>
            </div>
            <div className="flex justify-between py-0.5 border-b border-border-subtle">
              <span className="text-text-muted">CAPA No. (D5-D6):</span>
              <strong className="text-purple-700 font-mono">{complaint.capaNo || 'Generated upon closure'}</strong>
            </div>
            <div className="flex justify-between py-0.5 border-b border-border-subtle">
              <span className="text-text-muted">30-Day Verification (D7):</span>
              <strong className={complaint.effectivenessStatus === 'EFFECTIVE' ? 'text-emerald-700' : 'text-amber-700'}>
                {complaint.effectivenessStatus || 'Standard Met'}
              </strong>
            </div>
            {complaint.finalEvidence && (
              <div className="flex justify-between py-0.5">
                <span className="text-text-muted">Final Evidence (D8):</span>
                <span className="text-emerald-700 font-semibold truncate max-w-[150px]" title={complaint.finalEvidence}>
                  Recorded
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Sign-off Form or Closed Confirmation */}
      <div className="lg:col-span-7 bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <Save className="w-4 h-4 text-emerald-600" />
            Closure Sign-off & Final Approval
          </h4>
          <span className="text-[11px] font-semibold text-emerald-700">
            {complaint.status === 'CLOSED' ? 'Case Closed & Locked' : 'Ready for Sign-off'}
          </span>
        </div>

        {complaint.status === 'CLOSED' ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Case Formally Closed & Archived (Step D8 Complete)</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                This complaint case has completed all 8D stages (D1 through D8) and received formal quality sign-off. Records are archived in read-only mode for traceability and audit compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-surface-canvas rounded-xl border border-border-subtle">
                <span className="text-[11px] text-text-muted block">Closure Approval Date:</span>
                <span className="font-bold text-text-primary">{complaint.closureDate || closureData.closureDate || 'N/A'}</span>
              </div>
              <div className="p-3 bg-surface-canvas rounded-xl border border-border-subtle">
                <span className="text-[11px] text-text-muted block">Final Resolution Status:</span>
                <span className="font-bold text-emerald-700">{complaint.finalStatus || closureData.finalStatus || 'ACCEPTED'}</span>
              </div>
            </div>

            {(complaint.finalEvidence || closureData.finalEvidence) && (
              <div className="p-3 bg-surface-canvas rounded-xl border border-border-subtle text-xs">
                <span className="text-[11px] text-text-muted block mb-1">Final Evidence & Documentation:</span>
                {((complaint.finalEvidence || closureData.finalEvidence).startsWith('http://') ||
                  (complaint.finalEvidence || closureData.finalEvidence).startsWith('https://')) ? (
                  <a
                    href={complaint.finalEvidence || closureData.finalEvidence}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold text-xs break-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    {complaint.finalEvidence || closureData.finalEvidence}
                  </a>
                ) : (
                  <p className="text-text-primary font-medium break-all">
                    {complaint.finalEvidence || closureData.finalEvidence}
                  </p>
                )}
              </div>
            )}

            <div className="p-3 bg-surface-canvas rounded-xl border border-border-subtle text-xs">
              <span className="text-[11px] text-text-muted block mb-1">Closure Remarks:</span>
              <p className="text-text-primary whitespace-pre-wrap">
                {complaint.remarks || closureData.remarks || 'No additional remarks.'}
              </p>
            </div>

            {onReopenCase && (
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onReopenCase()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-amber-300 hover:bg-amber-50 text-amber-800 text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  Request Ticket Reopen
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Closure Date:
                </label>
                <input
                  type="date"
                  value={closureData.closureDate}
                  onChange={(e) => setClosureData((prev) => ({ ...prev, closureDate: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Final Resolution Status:
                </label>
                <input
                  type="text"
                  value={closureData.finalStatus}
                  onChange={(e) => setClosureData((prev) => ({ ...prev, finalStatus: e.target.value }))}
                  placeholder="e.g., ACCEPTED / CLOSED"
                  className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-secondary">
                Final Evidence Documentation (Bằng chứng nghiệm thu / Ký duyệt hoàn tất):
              </label>
              <FileUpload
                label=""
                accept="image/*,application/pdf"
                maxSizeMb={20}
                category="complaint"
                onUploadSuccess={({ tmpKey, file }) => {
                  setFinalEvidenceTmpKey(tmpKey || null);
                  setClosureData((prev) => ({
                    ...prev,
                    finalEvidence: prev.finalEvidence
                      ? `${prev.finalEvidence}; [File: ${file.name}]`
                      : `[File: ${file.name}]`,
                  }));
                }}
              />
              <input
                type="text"
                value={closureData.finalEvidence}
                onChange={(e) => setClosureData((prev) => ({ ...prev, finalEvidence: e.target.value }))}
                placeholder="Hoặc dán URL/ghi chú bằng chứng: https://... hoặc mã ref #CUST-ACCEPT..."
                className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Closure Remarks & Sign-off Notes:
              </label>
              <textarea
                rows={3}
                value={closureData.remarks}
                onChange={(e) => setClosureData((prev) => ({ ...prev, remarks: e.target.value }))}
                placeholder="e.g., Customer approved final 8D report; verified zero defects on replacement shipment..."
                className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary font-sans"
              />
            </div>

            <button
              type="button"
              disabled={isUpdating}
              onClick={() =>
                handleUpdatePhase(
                  {
                    closureDate: closureData.closureDate,
                    finalStatus: closureData.finalStatus || 'ACCEPTED',
                    finalEvidence: closureData.finalEvidence || undefined,
                    finalEvidenceTmpKey: finalEvidenceTmpKey || undefined,
                    remarks: closureData.remarks,
                    status: 'CLOSED',
                  },
                  'Customer complaint case approved and closed successfully!'
                )
              }
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Approve & Formally Close Complaint Case (Phase 7)
            </button>

          </>
        )}
      </div>
    </>
  );
};
