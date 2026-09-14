import React from 'react';
import { FileSignature, X, Check } from 'lucide-react';
import type { ComplaintMeeting } from '@/types/complaint/complaint.types';

interface ConcludeMeetingModalProps {
  meeting: ComplaintMeeting | null;
  formData: {
    conclusion: string;
    minutes: string;
    agreedContainment: string;
    transitionToContainment: boolean;
  };
  isSubmitting: boolean;
  onClose: () => void;
  onChange: React.Dispatch<React.SetStateAction<{
    conclusion: string;
    minutes: string;
    agreedContainment: string;
    transitionToContainment: boolean;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
}

const QUICK_CONCLUSIONS = [
  'VALID Complaint - Urgent containment required within 48h',
  'VALID Complaint - Require supplier 8D corrective action report',
  'INFO REQUIRED - Request physical defect samples from customer',
  'INVALID Complaint - Customer operational misuse, provide rebuttal',
];

export const ConcludeMeetingModal: React.FC<ConcludeMeetingModalProps> = ({
  meeting,
  formData,
  isSubmitting,
  onClose,
  onChange,
  onSubmit,
}) => {
  if (!meeting) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-border-subtle w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-canvas/50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <FileSignature className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Confirm Meeting Concluded & Log Minutes
              </h3>
              <p className="text-[11px] text-text-muted">
                Meeting Date: {meeting.meetingDate} ({meeting.startTime}) at {meeting.roomLocation}
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
          {/* Conclusion with Quick Chips */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-text-secondary">
              Meeting Conclusion <span className="text-rose-500">*</span>:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {QUICK_CONCLUSIONS.map((chip) => (
                <button
                  type="button"
                  key={chip}
                  onClick={() => onChange((prev) => ({ ...prev, conclusion: chip }))}
                  className={`px-2.5 py-1 rounded-lg text-[11px] border transition-all cursor-pointer text-left ${
                    formData.conclusion === chip
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-surface-canvas border-border-subtle text-text-muted hover:text-text-primary'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              value={formData.conclusion}
              onChange={(e) => onChange((prev) => ({ ...prev, conclusion: e.target.value }))}
              placeholder="Enter or select meeting conclusion..."
              className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-xl text-text-primary focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Minutes */}
          <div className="space-y-1">
            <label className="block font-semibold text-text-secondary">
              Meeting Minutes & Discussion Records:
            </label>
            <textarea
              rows={3}
              value={formData.minutes}
              onChange={(e) => onChange((prev) => ({ ...prev, minutes: e.target.value }))}
              placeholder="Record attendees, discussion highlights, agreed technical directions, and decisions..."
              className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-xl text-text-primary focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-sans"
            />
          </div>

          {/* Agreed Containment Action */}
          <div className="space-y-1">
            <label className="block font-semibold text-text-secondary">
              Agreed Containment Actions:
            </label>
            <textarea
              rows={2}
              value={formData.agreedContainment}
              onChange={(e) => onChange((prev) => ({ ...prev, agreedContainment: e.target.value }))}
              placeholder="e.g., Quarantine 500 parts in Warehouse A; halt line #2 to verify reflow thermal profile..."
              className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-xl text-text-primary focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-sans"
            />
          </div>

          {/* Checkbox auto sync */}
          <label className="flex items-center gap-2 p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={formData.transitionToContainment}
              onChange={(e) => onChange((prev) => ({ ...prev, transitionToContainment: e.target.checked }))}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span className="text-[11px] text-emerald-950 font-medium leading-relaxed">
              Automatically populate into <strong>Containment Action</strong> and activate <strong>Phase 3</strong>
            </span>
          </label>

          {/* Action Buttons */}
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
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              {isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Minutes & Conclude Meeting
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
