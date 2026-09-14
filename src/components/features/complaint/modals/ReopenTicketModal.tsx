import React from 'react';
import { RotateCcw, X } from 'lucide-react';
import type { ComplaintDetail } from '@/types/complaint/complaint.types';

interface ReopenTicketModalProps {
  isOpen: boolean;
  complaint: ComplaintDetail | null;
  reopenTargetStatus: string;
  reopenReason: string;
  isSubmitting: boolean;
  onClose: () => void;
  onTargetStatusChange: (status: string) => void;
  onReasonChange: (reason: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ReopenTicketModal: React.FC<ReopenTicketModalProps> = ({
  isOpen,
  complaint,
  reopenTargetStatus,
  reopenReason,
  isSubmitting,
  onClose,
  onTargetStatusChange,
  onReasonChange,
  onSubmit,
}) => {
  if (!isOpen || !complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-border-subtle w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <RotateCcw className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Reopen Complaint Case (8D Ticket)
              </h3>
              <p className="text-[11px] text-text-muted">
                Case ID: #{complaint.id} • Customer: {complaint.customerName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-[11px] leading-relaxed">
            <strong>Important Audit Notice:</strong> Reopening a closed case resets the closure date, returns the workflow to your selected stage for further CFT investigation, and records the reopening justification into the audit trail per IATF 16949 standards.
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-text-secondary">
              Reopen and return case to which workflow phase? <span className="text-rose-500">*</span>
            </label>
            <select
              value={reopenTargetStatus}
              onChange={(e) => onTargetStatusChange(e.target.value)}
              className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-xl text-text-primary text-xs"
            >
              <option value="ROOT_CAUSE_ANALYZED">Phase 4: Re-investigate Root Cause (5-Why)</option>
              <option value="CAPA_COMMITTED">Phase 5: Revise / Supplement CAPA Plan</option>
              <option value="EFFECTIVENESS_VERIFYING">Phase 6: Extend / Re-verify 30-Day Effectiveness</option>
              <option value="CONTAINMENT_COMMITTED">Phase 3: Reset Interim Containment Actions</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-text-secondary">
              Reopening Justification (Audit Trail Reason) <span className="text-rose-500">*</span>:
            </label>
            <textarea
              rows={3}
              required
              value={reopenReason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="e.g., Customer reported defect recurrence in new batch; 30-day verification PPM exceeded allowable threshold..."
              className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-xl text-text-primary text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !reopenReason.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              {isSubmitting ? (
                'Processing...'
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  Confirm Reopen Case
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
