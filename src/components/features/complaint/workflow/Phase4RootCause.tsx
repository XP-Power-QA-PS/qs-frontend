import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Save,
  CheckSquare,
  RotateCcw,
} from 'lucide-react';
import type { ComplaintDetail, ComplaintUpdateRequest } from '@/types/complaint/complaint.types';

export interface Phase4RootCauseProps {
  complaint: ComplaintDetail;
  isUpdating: boolean;
  handleUpdatePhase: (
    data: ComplaintUpdateRequest,
    successMsg: string,
    nextPhase?: 2 | 3 | 4 | 5 | 6 | 7
  ) => Promise<void>;
  onReopenCase?: () => void;
}

export const Phase4RootCause: React.FC<Phase4RootCauseProps> = ({
  complaint,
  isUpdating,
  handleUpdatePhase,
  onReopenCase,
}) => {
  const [rootCauseData, setRootCauseData] = useState({
    rootCause: complaint.rootCause || '',
    rootCauseCategory: complaint.rootCauseCategory || 'Method',
    rootCauseOwner: complaint.rootCauseOwner || '',
    rootCauseCompletionDate: complaint.rootCauseCompletionDate || '',
    occurrenceCause: '',
    escapeCause: '',
  });

  useEffect(() => {
    setRootCauseData((prev) => ({
      ...prev,
      rootCause: complaint.rootCause || '',
      rootCauseCategory: complaint.rootCauseCategory || 'Method',
      rootCauseOwner: complaint.rootCauseOwner || '',
      rootCauseCompletionDate: complaint.rootCauseCompletionDate || '',
    }));
  }, [complaint]);
  return (
    <>
      {/* Left Column: Context */}
      <div className="lg:col-span-5 bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              4
            </span>
            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Phase 4: Root Cause Analysis (5-Why)
              </h4>
              <span className="text-[11px] text-indigo-800 font-semibold">SLA: 5 Business Days</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            8D - Step D4
          </span>
        </div>

        {/* Evidence from Phase 3 */}
        <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs space-y-1.5 text-indigo-950">
          <strong className="font-bold flex items-center gap-1.5 text-indigo-900">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            Established Interim Containment (D3 Baseline):
          </strong>
          <p className="bg-white p-2.5 rounded-lg border border-indigo-200 text-[11px] text-text-primary whitespace-pre-wrap">
            {complaint.containmentAction || 'Suspected inventory quarantined'}
          </p>
        </div>

        {/* Defect Details */}
        <div className="p-3.5 bg-surface-canvas border border-border-subtle rounded-xl text-xs space-y-1.5">
          <strong className="text-text-primary block text-[11px] uppercase tracking-wider">
            Defect Symptom Under Investigation:
          </strong>
          <div className="text-[11px] space-y-1 text-text-secondary">
            <p>Model: <strong className="text-text-primary">{complaint.model}</strong> • Defect: <strong className="text-rose-600">{complaint.defectName}</strong></p>
            <p>Description: {complaint.issueDescription}</p>
          </div>
        </div>

        {/* Methodology */}
        <div className="p-3.5 bg-surface-canvas rounded-xl text-xs space-y-1.5 border border-border-subtle">
          <strong className="text-text-primary block text-[11px]">Standard 2-Branch 5-Why Methodology:</strong>
          <p className="text-text-secondary text-[11px] leading-relaxed">
            Must investigate both core failure mechanisms:
          </p>
          <ul className="list-disc pl-4 text-text-secondary text-[11px] space-y-1">
            <li><strong>Occurrence:</strong> Why did the defect happen during production/manufacturing?</li>
            <li><strong>Escape:</strong> Why did the quality control system fail to detect it before customer delivery?</li>
          </ul>
        </div>
      </div>

      {/* Right Column: 2-Branch Root Cause Form */}
      <div className="lg:col-span-7 bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-600" />
            5-Why Investigation & Root Cause Synthesis
          </h4>
          <span className="text-[11px] font-semibold text-indigo-700">
            {complaint.rootCause ? 'Root Cause Identified' : 'Investigation In Progress'}
          </span>
        </div>

        {/* 6M Category, Owner & Completion Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-surface-canvas rounded-xl border border-border-subtle">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Root Cause Category (6M) <span className="text-rose-500">*</span>:
            </label>
            <select
              disabled={complaint.status === 'CLOSED'}
              value={rootCauseData.rootCauseCategory}
              onChange={(e) => setRootCauseData((prev) => ({ ...prev, rootCauseCategory: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-white border border-border-subtle rounded-xl text-text-primary focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="Method">Method (Phương pháp / Quy trình)</option>
              <option value="Machine">Machine (Thiết bị / Máy móc)</option>
              <option value="Man">Man (Con người / Thao tác)</option>
              <option value="Material">Material (Nguyên vật liệu / Linh kiện)</option>
              <option value="Measurement">Measurement (Đo lường / Kiểm tra)</option>
              <option value="Environment">Environment (Môi trường / Bảo quản)</option>
              <option value="Other">Other (Khác)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Investigation Lead / Owner:
            </label>
            <input
              type="text"
              disabled={complaint.status === 'CLOSED'}
              value={rootCauseData.rootCauseOwner}
              onChange={(e) => setRootCauseData((prev) => ({ ...prev, rootCauseOwner: e.target.value }))}
              placeholder="e.g., CQE Engineer / Quality Lead"
              className="w-full px-3 py-2 text-xs bg-white border border-border-subtle rounded-xl text-text-primary focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Analysis Completion Date:
            </label>
            <input
              type="date"
              disabled={complaint.status === 'CLOSED'}
              value={rootCauseData.rootCauseCompletionDate}
              onChange={(e) => setRootCauseData((prev) => ({ ...prev, rootCauseCompletionDate: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-white border border-border-subtle rounded-xl text-text-primary focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            1. Occurrence Root Cause (Why did it happen?):
          </label>
          <textarea
            rows={2}
            disabled={complaint.status === 'CLOSED'}
            value={rootCauseData.occurrenceCause}
            onChange={(e) => setRootCauseData((prev) => ({ ...prev, occurrenceCause: e.target.value }))}
            placeholder="e.g., Soldering tip temperature dropped abruptly due to oxidized thermocouple probe..."
            className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-sans disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            2. Escape / Detection Root Cause (Why did it reach customer?):
          </label>
          <textarea
            rows={2}
            disabled={complaint.status === 'CLOSED'}
            value={rootCauseData.escapeCause}
            onChange={(e) => setRootCauseData((prev) => ({ ...prev, escapeCause: e.target.value }))}
            placeholder="e.g., 2-hourly visual naked-eye inspection was unable to detect micro-cracks below 0.1mm..."
            className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-sans disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-text-secondary">
              Synthesized Root Cause Conclusion <span className="text-rose-500">*</span>:
            </label>
            {complaint.status !== 'CLOSED' && (rootCauseData.occurrenceCause || rootCauseData.escapeCause) && (
              <button
                type="button"
                onClick={() => {
                  const combined = [
                    rootCauseData.occurrenceCause ? `[Occurrence]: ${rootCauseData.occurrenceCause}` : '',
                    rootCauseData.escapeCause ? `[Escape / Detection]: ${rootCauseData.escapeCause}` : '',
                    rootCauseData.rootCause && !rootCauseData.rootCause.includes('[Occurrence') && !rootCauseData.rootCause.includes('[Phát sinh') ? rootCauseData.rootCause : '',
                  ].filter(Boolean).join('\n\n');
                  setRootCauseData((prev) => ({ ...prev, rootCause: combined }));
                }}
                className="text-[11px] text-indigo-700 hover:text-indigo-900 font-bold underline cursor-pointer"
              >
                Combine both branches into conclusion
              </button>
            )}
          </div>
          <textarea
            rows={3}
            disabled={complaint.status === 'CLOSED'}
            value={rootCauseData.rootCause}
            onChange={(e) => setRootCauseData((prev) => ({ ...prev, rootCause: e.target.value }))}
            placeholder="e.g., Why 1: Cracked solder joint -> Why 2: Tip temperature fluctuated -> Why 3: Thermocouple probe oxidization..."
            className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-sans disabled:opacity-60 disabled:cursor-not-allowed"
          />
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
              disabled={isUpdating || !rootCauseData.rootCause.trim()}
              onClick={() =>
                handleUpdatePhase(
                  {
                    rootCause: rootCauseData.rootCause,
                    rootCauseCategory: rootCauseData.rootCauseCategory,
                    rootCauseOwner: rootCauseData.rootCauseOwner || undefined,
                    rootCauseCompletionDate: rootCauseData.rootCauseCompletionDate || undefined,
                    status: 'ROOT_CAUSE_ANALYZED',
                  },
                  'Root cause investigation progress saved successfully!'
                )
              }
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border-subtle hover:bg-surface-canvas text-text-secondary text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-text-muted" />
              Save Root Cause Progress
            </button>

            <button
              type="button"
              disabled={isUpdating || !rootCauseData.rootCause.trim()}
              onClick={() => {
                handleUpdatePhase(
                  {
                    rootCause: rootCauseData.rootCause,
                    rootCauseCategory: rootCauseData.rootCauseCategory,
                    rootCauseOwner: rootCauseData.rootCauseOwner || undefined,
                    rootCauseCompletionDate: rootCauseData.rootCauseCompletionDate || undefined,
                    status: 'CAPA_COMMITTED',
                  },
                  'Root Cause (D4) approved! Phase 5 (CAPA Plan) activated.',
                  5
                );
              }}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              Approve Root Cause & Proceed to Phase 5 &rarr;
            </button>
          </div>
        )}
      </div>
    </>
  );
};
