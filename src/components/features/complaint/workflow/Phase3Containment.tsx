import React from 'react';
import {
  ShieldAlert,
  Copy,
  CheckCircle2,
  Save,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import type { ComplaintDetail, ComplaintMeeting, ComplaintUpdateRequest } from '@/types/complaint/complaint.types';

interface Phase3ContainmentProps {
  complaint: ComplaintDetail;
  containmentData: {
    containmentAction: string;
    containmentDueDate: string;
    containmentOwner: string;
    containmentCompletionDate: string;
    containmentStatus: string;
    inHouseQty: string;
    inHouseRedTagged: boolean;
    customerQty: string;
    customerNotified: boolean;
    cleanPoint: string;
  };
  setContainmentData: React.Dispatch<
    React.SetStateAction<{
      containmentAction: string;
      containmentDueDate: string;
      containmentOwner: string;
      containmentCompletionDate: string;
      containmentStatus: string;
      inHouseQty: string;
      inHouseRedTagged: boolean;
      customerQty: string;
      customerNotified: boolean;
      cleanPoint: string;
    }>
  >;
  isUpdating: boolean;
  handleUpdatePhase: (
    data: ComplaintUpdateRequest,
    successMsg: string,
    nextPhase?: 2 | 3 | 4 | 5 | 6 | 7
  ) => Promise<void>;
  setShowReopenModal: (show: boolean) => void;
  latestConcludedMeeting?: ComplaintMeeting;
}

export const Phase3Containment: React.FC<Phase3ContainmentProps> = ({
  complaint,
  containmentData,
  setContainmentData,
  isUpdating,
  handleUpdatePhase,
  setShowReopenModal,
  latestConcludedMeeting,
}) => {
  return (
    <>
      {/* Left Column: Context & Prior Meeting Evidence */}
      <div className="lg:col-span-5 bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
              3
            </span>
            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Phase 3: Interim Containment Action (D3)
              </h4>
              <span className="text-[11px] text-sky-800 font-semibold">SLA: 2 Business Days (48h)</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
            8D - Step D3
          </span>
        </div>

        {/* Upstream Evidence from CFT Meeting */}
        <div className="p-3.5 bg-sky-50/70 border border-sky-200/80 rounded-xl text-xs space-y-2 text-sky-950">
          <div className="flex items-center justify-between font-bold text-sky-900">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              Inherited from Latest CFT Review Meeting:
            </span>
            {latestConcludedMeeting?.isConcluded && (
              <span className="text-[10px] bg-sky-100 px-2 py-0.5 rounded-full text-sky-800">
                Meeting Concluded
              </span>
            )}
          </div>

          {latestConcludedMeeting ? (
            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-sky-800 block font-semibold">Meeting Conclusion:</span>
                <p className="bg-white p-2 rounded-lg border border-sky-200 font-medium text-text-primary">
                  {latestConcludedMeeting.conclusion || 'No conclusion logged yet'}
                </p>
              </div>

              {latestConcludedMeeting.agreedContainment && (
                <div>
                  <span className="text-sky-800 block font-semibold">Containment proposal from minutes:</span>
                  <p className="bg-white p-2 rounded-lg border border-sky-200 text-text-secondary whitespace-pre-wrap">
                    {latestConcludedMeeting.agreedContainment}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setContainmentData((prev) => ({
                        ...prev,
                        containmentAction: latestConcludedMeeting.agreedContainment || prev.containmentAction,
                      }))
                    }
                    className="mt-1 inline-flex items-center gap-1 text-[11px] text-sky-700 hover:text-sky-900 font-bold underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" /> Populate proposal into Execution Form
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-sky-800 leading-relaxed">
              No CFT review minutes recorded yet. You may enter interim containment actions directly in the form on the right or convene a review meeting.
            </p>
          )}
        </div>

        {/* Definition of Done / IATF 16949 Standards */}
        <div className="p-3.5 bg-surface-canvas rounded-xl text-xs space-y-1.5 border border-border-subtle">
          <strong className="text-text-primary block text-[11px]">IATF 16949 Step D3 Acceptance Criteria:</strong>
          <ul className="list-disc pl-4 text-text-secondary text-[11px] space-y-1">
            <li>Quarantine 100% suspected parts/inventory at internal plant and customer warehouses.</li>
            <li>Affix physical Red Tags to prevent unintended shipment.</li>
            <li>Establish verified Clean Point from lot number or serial number.</li>
          </ul>
        </div>
      </div>

      {/* Right Column: Execution Form & 3-Way Checklist */}
      <div className="lg:col-span-7 bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-sky-600" />
            3-Way Inventory Containment Execution & Control
          </h4>
          <span className="text-[11px] font-semibold text-sky-700">
            Status: {complaint.containmentAction ? 'Containment Established' : 'Pending'}
          </span>
        </div>

        {/* 3-Way Containment Checklist Box */}
        <div className="p-3.5 bg-surface-canvas border border-border-subtle rounded-xl space-y-3 text-xs">
          <strong className="text-text-primary block text-[11px] uppercase tracking-wider">
            Inventory Containment 3-Way Checklist:
          </strong>

          {/* Line 1: In-House & WIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-2 bg-white rounded-lg border border-border-subtle">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                1. In-House & WIP (Quarantined Quantity):
              </label>
              <input
                type="text"
                disabled={complaint.status === 'CLOSED'}
                value={containmentData.inHouseQty}
                onChange={(e) => setContainmentData((prev) => ({ ...prev, inHouseQty: e.target.value }))}
                placeholder="e.g., 500 EA (Warehouse A)"
                className="w-full px-2.5 py-1.5 text-xs bg-surface-canvas border border-border-subtle rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className={`flex items-center gap-2 text-[11px] font-medium text-text-primary ${complaint.status === 'CLOSED' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  disabled={complaint.status === 'CLOSED'}
                  checked={containmentData.inHouseRedTagged}
                  onChange={(e) => setContainmentData((prev) => ({ ...prev, inHouseRedTagged: e.target.checked }))}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                Red Tag affixed & physically quarantined
              </label>
            </div>
          </div>

          {/* Line 2: At Customer & In-Transit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-2 bg-white rounded-lg border border-border-subtle">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                2. At Customer & In-Transit:
              </label>
              <input
                type="text"
                disabled={complaint.status === 'CLOSED'}
                value={containmentData.customerQty}
                onChange={(e) => setContainmentData((prev) => ({ ...prev, customerQty: e.target.value }))}
                placeholder="e.g., 150 EA at customer hub"
                className="w-full px-2.5 py-1.5 text-xs bg-surface-canvas border border-border-subtle rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className={`flex items-center gap-2 text-[11px] font-medium text-text-primary ${complaint.status === 'CLOSED' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  disabled={complaint.status === 'CLOSED'}
                  checked={containmentData.customerNotified}
                  onChange={(e) => setContainmentData((prev) => ({ ...prev, customerNotified: e.target.checked }))}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                Customer notified / 100% sorting dispatched
              </label>
            </div>
          </div>

          {/* Line 3: Clean Point */}
          <div className="p-2 bg-white rounded-lg border border-border-subtle">
            <label className="block text-[11px] font-semibold text-text-secondary mb-1">
              3. Clean Point (First Confirmed Safe Lot/Serial):
            </label>
            <input
              type="text"
              disabled={complaint.status === 'CLOSED'}
              value={containmentData.cleanPoint}
              onChange={(e) => setContainmentData((prev) => ({ ...prev, cleanPoint: e.target.value }))}
              placeholder="e.g., From Serial #SN-90234 or Production Lot 2026-09-12 is 100% safe..."
              className="w-full px-2.5 py-1.5 text-xs bg-surface-canvas border border-border-subtle rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Detailed Action Textarea */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            Interim Containment Action Summary <span className="text-rose-500">*</span>:
          </label>
          <textarea
            rows={3}
            disabled={complaint.status === 'CLOSED'}
            value={containmentData.containmentAction}
            onChange={(e) => setContainmentData((prev) => ({ ...prev, containmentAction: e.target.value }))}
            placeholder="e.g., Quarantined 500 parts in Warehouse A, halted line SMT-2 to verify reflow thermal profile..."
            className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 font-sans disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Containment Action Owner:
            </label>
            <input
              type="text"
              disabled={complaint.status === 'CLOSED'}
              value={containmentData.containmentOwner}
              onChange={(e) => setContainmentData((prev) => ({ ...prev, containmentOwner: e.target.value }))}
              placeholder="e.g., QA Lead, Warehouse Manager..."
              className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Target Due Date (SLA: 48h):
            </label>
            <input
              type="date"
              disabled={complaint.status === 'CLOSED'}
              value={containmentData.containmentDueDate}
              onChange={(e) => setContainmentData((prev) => ({ ...prev, containmentDueDate: e.target.value }))}
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
              value={containmentData.containmentCompletionDate}
              onChange={(e) => setContainmentData((prev) => ({ ...prev, containmentCompletionDate: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary disabled:opacity-60 disabled:cursor-not-allowed"
            />
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
              onClick={() => setShowReopenModal(true)}
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
              disabled={isUpdating || !containmentData.containmentAction.trim()}
              onClick={() => {
                const actionSummary = [
                  containmentData.containmentAction,
                  containmentData.inHouseQty ? `[In-House: ${containmentData.inHouseQty} EA, ${containmentData.inHouseRedTagged ? 'Red Tagged' : 'Pending'}]` : '',
                  containmentData.customerQty ? `[Customer: ${containmentData.customerQty} EA, ${containmentData.customerNotified ? 'Notified/Sorting' : 'Pending'}]` : '',
                  containmentData.cleanPoint ? `[Clean Point: ${containmentData.cleanPoint}]` : '',
                ].filter(Boolean).join(' | ');

                handleUpdatePhase(
                  {
                    containmentAction: actionSummary,
                    containmentDueDate: containmentData.containmentDueDate || undefined,
                    containmentOwner: containmentData.containmentOwner || undefined,
                    containmentCompletionDate: containmentData.containmentCompletionDate || undefined,
                    containmentStatus: containmentData.containmentCompletionDate ? 'COMPLETED' : 'IN_PROGRESS',
                    status:
                      complaint.status === 'RECEIVED' || complaint.status === 'MEETING_SCHEDULED'
                        ? 'CONTAINMENT_COMMITTED'
                        : complaint.status,
                  },
                  'Containment action progress saved successfully!'
                );
              }}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border-subtle hover:bg-surface-canvas text-text-secondary text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-text-muted" />
              Save Containment Progress
            </button>

            <button
              type="button"
              disabled={isUpdating || !containmentData.containmentAction.trim()}
              onClick={() => {
                const actionSummary = [
                  containmentData.containmentAction,
                  containmentData.inHouseQty ? `[In-House: ${containmentData.inHouseQty} EA, ${containmentData.inHouseRedTagged ? 'Red Tagged' : 'Pending'}]` : '',
                  containmentData.customerQty ? `[Customer: ${containmentData.customerQty} EA, ${containmentData.customerNotified ? 'Notified/Sorting' : 'Pending'}]` : '',
                  containmentData.cleanPoint ? `[Clean Point: ${containmentData.cleanPoint}]` : '',
                ].filter(Boolean).join(' | ');

                handleUpdatePhase(
                  {
                    containmentAction: actionSummary,
                    containmentDueDate: containmentData.containmentDueDate || undefined,
                    containmentOwner: containmentData.containmentOwner || undefined,
                    containmentCompletionDate: containmentData.containmentCompletionDate || undefined,
                    containmentStatus: 'COMPLETED',
                    status: 'ROOT_CAUSE_ANALYZED',
                  },
                  'Containment (D3) approved! Phase 4 (Root Cause Analysis) activated.',
                  4
                );
              }}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Approve Containment & Proceed to Phase 4 &rarr;
            </button>
          </div>
        )}
      </div>
    </>
  );
};
