import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Calendar, Loader2, Award } from 'lucide-react';
import { complaintService } from '@/services/complaint/complaintService';
import type { ComplaintDetail, ComplaintUpdateRequest } from '@/types/complaint/complaint.types';

interface ComplaintClosureModalProps {
  isOpen: boolean;
  complaint: ComplaintDetail;
  onClose: () => void;
  onSuccess: (updated: ComplaintDetail) => void;
}

export const ComplaintClosureModal: React.FC<ComplaintClosureModalProps> = ({
  isOpen,
  complaint,
  onClose,
  onSuccess,
}) => {
  const [closureDate, setClosureDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [finalStatus, setFinalStatus] = useState<string>(complaint.finalStatus || 'Closed');
  const [remarks, setRemarks] = useState<string>(complaint.remarks || '');
  const [finalEvidence, setFinalEvidence] = useState<string>(complaint.finalEvidence || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate projected Ageing Closed
  let projectedAgeing = 0;
  try {
    const rec = new Date(complaint.receivedDate).getTime();
    const cls = new Date(closureDate).getTime();
    projectedAgeing = Math.max(0, Math.round((cls - rec) / (1000 * 60 * 60 * 24)));
  } catch (e) {
    projectedAgeing = 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload: ComplaintUpdateRequest = {
        closureDate,
        finalStatus,
        status: 'CLOSED',
        remarks,
        finalEvidence: finalEvidence || undefined,
      };

      const updated = await complaintService.updateComplaint(complaint.id, payload);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to close complaint case. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-border-subtle rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-canvas">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Close Complaint Case (Case Closure)
              </h2>
              <p className="text-xs text-text-muted">
                Confirm resolution completion and lock the final Ageing Closed metric
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Context Snippet */}
          <div className="p-3.5 bg-surface-canvas rounded-xl border border-border-subtle grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="text-text-muted block">Tracking No:</span>
              <strong className="text-text-primary font-mono text-xs">{complaint.trackingNo}</strong>
            </div>
            <div>
              <span className="text-text-muted block">Customer / Model:</span>
              <strong className="text-text-primary">{complaint.customerName} - {complaint.model}</strong>
            </div>
            <div>
              <span className="text-text-muted block">Received Date:</span>
              <strong className="text-text-primary">{complaint.receivedDate}</strong>
            </div>
            <div>
              <span className="text-text-muted block">Projected Ageing at Closure:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {projectedAgeing} days
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Closure Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-muted" />
                <input
                  type="date"
                  required
                  value={closureDate}
                  onChange={(e) => setClosureDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Final Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={finalStatus}
                onChange={(e) => setFinalStatus(e.target.value)}
                className="w-full px-3 py-2 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary text-xs font-semibold"
              >
                <option value="Closed">Closed (Resolved & Approved)</option>
                <option value="Rejected">Rejected (Invalid complaint / Misuse)</option>
                <option value="Cancelled">Cancelled (Complaint cancelled)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Final Evidence / Sign-off Document Link (Final Evidence)
            </label>
            <input
              type="text"
              value={finalEvidence}
              onChange={(e) => setFinalEvidence(e.target.value)}
              placeholder="e.g. Acceptance Sign-off QC-2026-089 / 100% Sorting inspection report"
              className="w-full px-3 py-2 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              Final Remarks / Lessons Learned (Remarks)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Enter closure remarks, lessons learned, or customer confirmation feedback..."
              className="w-full px-3 py-2 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary text-xs resize-y leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-text-secondary bg-surface-subtle hover:bg-border-subtle rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Confirm Case Closure
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
