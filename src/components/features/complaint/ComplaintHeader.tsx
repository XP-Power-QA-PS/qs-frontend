import React from 'react';
import {
  ArrowLeft,
  Clock,
  Sparkles,
  Calendar,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import type { ComplaintDetail } from '@/types/complaint/complaint.types';
import { COMPLAINT_STAGE_META } from '@/types/complaint/complaint.types';
import { computeSlaStatus } from '@/utils/slaUtils';

interface ComplaintHeaderProps {
  complaint: ComplaintDetail;
  activeWorkflowPhase: number;
  isPhase6Verified: boolean;
  onBack: () => void;
  onNavigateToMeetings: () => void;
  onNavigateToWorkflow: () => void;
  onReopenRequest: () => void;
}

export const ComplaintHeader: React.FC<ComplaintHeaderProps> = ({
  complaint,
  activeWorkflowPhase,
  isPhase6Verified,
  onBack,
  onNavigateToMeetings,
  onNavigateToWorkflow,
  onReopenRequest,
}) => {
  const stageMeta = COMPLAINT_STAGE_META[complaint.status];
  const slaInfo = computeSlaStatus(complaint);

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 bg-white border border-border-subtle rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-canvas transition-colors shadow-2xs cursor-pointer"
            title="Back to list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary font-mono">
                {complaint.trackingNo}
              </h1>
              {complaint.capaNo && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-purple-50 text-purple-700 border border-purple-200">
                  {complaint.capaNo}
                </span>
              )}
              {complaint.priority && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    complaint.priority === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : complaint.priority === 'HIGH'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : complaint.priority === 'LOW'
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {complaint.priority}
                </span>
              )}
              {complaint.status === 'CLOSED' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                  Phase 7: Case Closed
                </span>
              ) : isPhase6Verified && activeWorkflowPhase === 7 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                  Phase 7: Ready for Closure
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${stageMeta.badgeClass}`}
                >
                  Phase {stageMeta.stage}: {stageMeta.title}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] border ${slaInfo.badgeClass}`}
                title={slaInfo.message}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${slaInfo.dotClass}`}></span>
                {slaInfo.statusText}
              </span>

              {/* Ageing KPI Badge */}
              {complaint.status === 'CLOSED' ? (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium border bg-slate-100 text-slate-700 border-slate-200"
                  title="Total resolution time from intake to case closure"
                >
                  <Clock className="w-3 h-3 text-slate-500" />
                  Ageing Closed: <strong>{complaint.ageingClosed ?? 0} days</strong>
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                    (complaint.ageingOpen ?? 0) > 14
                      ? 'bg-red-50 text-red-700 border-red-200 font-semibold'
                      : (complaint.ageingOpen ?? 0) > 7
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                  title="Days elapsed with open complaint"
                >
                  <Clock className="w-3 h-3 text-blue-500" />
                  Ageing Open: <strong>{complaint.ageingOpen ?? 0} days</strong>
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Customer: <strong className="text-text-primary">{complaint.customerName}</strong> • Model:{' '}
              <strong className="text-text-primary">{complaint.model}</strong> • Received Date:{' '}
              {complaint.receivedDate}
            </p>
          </div>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onNavigateToWorkflow}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-xl border border-primary/20 shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            8D Stage-Gate & Verification
          </button>

          <button
            type="button"
            onClick={onNavigateToMeetings}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-border-subtle hover:bg-surface-canvas text-text-primary text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Schedule CFT Meeting
          </button>
        </div>
      </div>

      {/* Closed / Archived Banner */}
      {complaint.status === 'CLOSED' ? (
        <div className="bg-emerald-50/90 border border-emerald-300 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  🔒 CASE APPROVED FOR CLOSURE & ARCHIVED FOR QUALITY AUDIT
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                  8D Complete
                </span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Case approved for closure on <strong>{complaint.closureDate || 'N/A'}</strong> (Conclusion: <strong className="font-semibold text-emerald-950">{complaint.finalStatus || 'ACCEPTED'}</strong>). All records are safely preserved in <strong>Read-Only mode</strong> for IATF 16949 / ISO 9001 compliance.
              </p>
              {complaint.remarks && (
                <p className="text-[11px] text-emerald-700 bg-white/80 p-2 rounded-lg border border-emerald-200 mt-1">
                  <strong>Approval Remarks:</strong> {complaint.remarks}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            <button
              type="button"
              onClick={onReopenRequest}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
              title="Reopen case upon defect recurrence or customer feedback"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reopen Case
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Dynamic SLA Notification Banner */}
          {slaInfo.isOverdue && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-2xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-rose-900">
                  ⚠️ JEANETTE SLA PROGRESS WARNING
                </h4>
                <p className="text-xs text-rose-800 leading-relaxed">
                  {slaInfo.message} Subsequent stages are not locked — click the <strong>"8D Stage-Gate & Verification"</strong> tab to update actions and get the case back on track at any time!
                </p>
              </div>
            </div>
          )}

          {slaInfo.isNearing && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-2xs flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-amber-900">
                  ⚡ SLA DEADLINE APPROACHING (DUE TODAY)
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {slaInfo.message} Please update corresponding actions to maintain SLA compliance.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
