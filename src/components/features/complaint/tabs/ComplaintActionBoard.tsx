import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Calendar,
  User,
  Save,
  Loader2,
} from 'lucide-react';
import type { ComplaintDetail, ComplaintUpdateRequest } from '@/types/complaint/complaint.types';

interface ComplaintActionBoardProps {
  complaint: ComplaintDetail;
  isUpdating: boolean;
  onUpdate: (payload: ComplaintUpdateRequest, successMessage: string) => Promise<boolean | void>;
}

export const ComplaintActionBoard: React.FC<ComplaintActionBoardProps> = ({
  complaint,
  isUpdating,
  onUpdate,
}) => {
  // 1. Containment Local State
  const [containmentAction, setContainmentAction] = useState(complaint.containmentAction || '');
  const [containmentOwner, setContainmentOwner] = useState(complaint.containmentOwner || '');
  const [containmentDueDate, setContainmentDueDate] = useState(complaint.containmentDueDate || '');
  const [containmentStatus, setContainmentStatus] = useState(complaint.containmentStatus || 'IN_PROGRESS');
  const [containmentCompletionDate, setContainmentCompletionDate] = useState(complaint.containmentCompletionDate || '');

  // 2. Root Cause Local State
  const [rootCause, setRootCause] = useState(complaint.rootCause || '');
  const [rootCauseCategory, setRootCauseCategory] = useState(complaint.rootCauseCategory || 'Method / Process');
  const [rootCauseOwner, setRootCauseOwner] = useState(complaint.rootCauseOwner || '');
  const [rootCauseCompletionDate, setRootCauseCompletionDate] = useState(complaint.rootCauseCompletionDate || '');

  // 3. CAPA Local State
  const [correctiveAction, setCorrectiveAction] = useState(complaint.correctiveAction || '');
  const [preventiveAction, setPreventiveAction] = useState(complaint.preventiveAction || '');
  const [actionOwner, setActionOwner] = useState(complaint.actionOwner || '');
  const [actionDueDate, setActionDueDate] = useState(complaint.actionDueDate || '');
  const [actionStatus, setActionStatus] = useState(complaint.actionStatus || 'OPEN');
  const [capaCompletionDate, setCapaCompletionDate] = useState(complaint.capaCompletionDate || '');

  // Sync state when complaint prop changes
  useEffect(() => {
    setContainmentAction(complaint.containmentAction || '');
    setContainmentOwner(complaint.containmentOwner || '');
    setContainmentDueDate(complaint.containmentDueDate || '');
    setContainmentStatus(complaint.containmentStatus || 'IN_PROGRESS');
    setContainmentCompletionDate(complaint.containmentCompletionDate || '');

    setRootCause(complaint.rootCause || '');
    setRootCauseCategory(complaint.rootCauseCategory || 'Method / Process');
    setRootCauseOwner(complaint.rootCauseOwner || '');
    setRootCauseCompletionDate(complaint.rootCauseCompletionDate || '');

    setCorrectiveAction(complaint.correctiveAction || '');
    setPreventiveAction(complaint.preventiveAction || '');
    setActionOwner(complaint.actionOwner || '');
    setActionDueDate(complaint.actionDueDate || '');
    setActionStatus(complaint.actionStatus || 'OPEN');
    setCapaCompletionDate(complaint.capaCompletionDate || '');
  }, [complaint]);

  // Section Save Handlers
  const handleSaveContainment = async () => {
    await onUpdate(
      {
        containmentAction,
        containmentOwner,
        containmentDueDate: containmentDueDate || undefined,
        containmentStatus,
        containmentCompletionDate: containmentCompletionDate || undefined,
      },
      'Interim Containment Action saved successfully!'
    );
  };

  const handleSaveRootCause = async () => {
    await onUpdate(
      {
        rootCause,
        rootCauseCategory,
        rootCauseOwner,
        rootCauseCompletionDate: rootCauseCompletionDate || undefined,
      },
      'Root Cause Analysis saved successfully!'
    );
  };

  const handleSaveCapa = async () => {
    await onUpdate(
      {
        correctiveAction,
        preventiveAction,
        actionOwner,
        actionDueDate: actionDueDate || undefined,
        actionStatus,
        capaCompletionDate: capaCompletionDate || undefined,
      },
      'CAPA Plan saved successfully!'
    );
  };

  return (
    <div className="space-y-6">
      {/* Grid: 3 Main Technical Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* CARD 1: CONTAINMENT ACTION */}
        <div className="bg-white border border-border-subtle rounded-2xl shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border-subtle bg-surface-canvas/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  1. Interim Containment
                </h4>
                <span className="text-[11px] text-text-muted">Containment Action (Col 22)</span>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                containmentStatus === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {containmentStatus}
            </span>
          </div>

          <div className="p-4 space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Interim Containment Actions (Quarantine / Stock Sorting / Halt Shipment)
              </label>
              <textarea
                value={containmentAction}
                onChange={(e) => setContainmentAction(e.target.value)}
                placeholder="e.g. Quarantine 500 pcs from batch dated Sep 14 in Warehouse A. Perform 100% inspection before assembly..."
                rows={4}
                className="w-full px-3 py-2 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary resize-y text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Responsible Owner
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-muted" />
                  <input
                    type="text"
                    value={containmentOwner}
                    onChange={(e) => setContainmentOwner(e.target.value)}
                    placeholder="e.g. John Doe (Warehouse)"
                    className="w-full pl-8 pr-2.5 py-1.5 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-muted" />
                  <input
                    type="date"
                    value={containmentDueDate}
                    onChange={(e) => setContainmentDueDate(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Status
                </label>
                <select
                  value={containmentStatus}
                  onChange={(e) => setContainmentStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary text-xs"
                >
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Completion Date
                </label>
                <input
                  type="date"
                  value={containmentCompletionDate}
                  onChange={(e) => setContainmentCompletionDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary text-xs"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={handleSaveContainment}
                disabled={isUpdating}
                className="w-full inline-flex items-center justify-center gap-2 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50 text-xs"
              >
                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Containment Action
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: ROOT CAUSE ANALYSIS */}
        <div className="bg-white border border-border-subtle rounded-2xl shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border-subtle bg-surface-canvas/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  2. Root Cause Analysis
                </h4>
                <span className="text-[11px] text-text-muted">Root Cause Analysis (Col 21)</span>
              </div>
            </div>
            {rootCause && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800">
                IDENTIFIED
              </span>
            )}
          </div>

          <div className="p-4 space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Root Cause Category (5M1E)
              </label>
              <select
                value={rootCauseCategory}
                onChange={(e) => setRootCauseCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary text-xs"
              >
                <option value="Method / Process">Method / Process</option>
                <option value="Man / Operator">Man / Operator</option>
                <option value="Machine / Equipment">Machine / Equipment</option>
                <option value="Material / Component">Material / Component</option>
                <option value="Measurement">Measurement</option>
                <option value="Environment">Environment</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Root Cause Details (5-Why Investigation Outcome)
              </label>
              <textarea
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                placeholder="e.g. Inconsistent bolt tightening torque at Station 3 due to load cell zero-point drift after 6 months without routine calibration..."
                rows={4}
                className="w-full px-3 py-2 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary resize-y text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Investigation Lead
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-muted" />
                  <input
                    type="text"
                    value={rootCauseOwner}
                    onChange={(e) => setRootCauseOwner(e.target.value)}
                    placeholder="e.g. Jane Smith (PE)"
                    className="w-full pl-8 pr-2.5 py-1.5 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Identified Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-muted" />
                  <input
                    type="date"
                    value={rootCauseCompletionDate}
                    onChange={(e) => setRootCauseCompletionDate(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={handleSaveRootCause}
                disabled={isUpdating}
                className="w-full inline-flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50 text-xs"
              >
                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Root Cause Analysis
              </button>
            </div>
          </div>
        </div>

        {/* CARD 3: CAPA PLAN & IMPLEMENTATION */}
        <div className="bg-white border border-border-subtle rounded-2xl shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border-subtle bg-surface-canvas/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  3. Corrective & Preventive Action
                </h4>
                <span className="text-[11px] text-text-muted">CAPA Plan (Col 23, 24, 25, 26)</span>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                actionStatus === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              {actionStatus}
            </span>
          </div>

          <div className="p-4 space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Corrective Action (Fix immediate issue)
              </label>
              <textarea
                value={correctiveAction}
                onChange={(e) => setCorrectiveAction(e.target.value)}
                placeholder="e.g. Replace load cell sensor on Machine #2. Rework all 50 impacted units..."
                rows={2}
                className="w-full px-3 py-1.5 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary resize-y text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Preventive Action (Yokoten / Prevent recurrence)
              </label>
              <textarea
                value={preventiveAction}
                onChange={(e) => setPreventiveAction(e.target.value)}
                placeholder="e.g. Add bi-weekly torque sensor calibration to preventive maintenance (PM) checklist. Re-train line operators..."
                rows={2}
                className="w-full px-3 py-1.5 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary resize-y text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Action Owner
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-muted" />
                  <input
                    type="text"
                    value={actionOwner}
                    onChange={(e) => setActionOwner(e.target.value)}
                    placeholder="e.g. Alex Lee (QA/PE)"
                    className="w-full pl-8 pr-2.5 py-1.5 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-muted" />
                  <input
                    type="date"
                    value={actionDueDate}
                    onChange={(e) => setActionDueDate(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  CAPA Status
                </label>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary text-xs"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Completion Date
                </label>
                <input
                  type="date"
                  value={capaCompletionDate}
                  onChange={(e) => setCapaCompletionDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-surface-canvas rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary text-xs"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={handleSaveCapa}
                disabled={isUpdating}
                className="w-full inline-flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50 text-xs"
              >
                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save CAPA Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
