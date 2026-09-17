import React from 'react';
import {
  ArrowLeft,
  Clock,
  Calendar,
  ShieldCheck,
  RotateCcw,
  FileSpreadsheet,
  FolderCheck,
  Loader2,
} from 'lucide-react';
import type { ComplaintDetail } from '@/types/complaint/complaint.types';
import { COMPLAINT_STAGE_META } from '@/types/complaint/complaint.types';
import { computeSlaStatus } from '@/utils/slaUtils';

interface ComplaintHeaderProps {
  complaint: ComplaintDetail;
  onBack: () => void;
  onNavigateToMeetings: () => void;
  onOpenClosureModal: () => void;
  onReopenRequest?: () => void;
  onExportExcel: () => void;
  isExporting?: boolean;
}

export const ComplaintHeader: React.FC<ComplaintHeaderProps> = ({
  complaint,
  onBack,
  onNavigateToMeetings,
  onOpenClosureModal,
  onReopenRequest,
  onExportExcel,
  isExporting,
}) => {

  const stageMeta = COMPLAINT_STAGE_META[complaint.status] || {
    title: complaint.status,
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  const slaInfo = computeSlaStatus(complaint);
  const isClosed = complaint.status === 'CLOSED';

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Identity Bar */}
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
              <h1 className="text-xl font-bold text-text-primary font-mono tracking-tight">
                {complaint.trackingNo}
              </h1>
              {complaint.capaNo && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-purple-50 text-purple-700 border border-purple-200">
                  {complaint.capaNo}
                </span>
              )}

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${stageMeta.badgeClass}`}
              >
                {stageMeta.title}
              </span>

              {/* Ageing KPI Badge */}
              {isClosed ? (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium border bg-emerald-50 text-emerald-800 border-emerald-200"
                  title="Total turnaround time from intake to case closure"
                >
                  <Clock className="w-3 h-3 text-emerald-600" />
                  Ageing Closed: <strong>{complaint.ageingClosed ?? 0} days</strong>
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${slaInfo.badgeClass}`}
                  title={slaInfo.message}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${slaInfo.dotClass}`}></span>
                  Ageing Open: <strong>{complaint.ageingOpen ?? 0} days</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Action: Export Excel */}
          <button
            type="button"
            onClick={onExportExcel}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-border-subtle hover:bg-surface-canvas text-text-secondary hover:text-text-primary text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Export 32-column Excel template"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
            Export Excel
          </button>

          {/* Action: Schedule Review Meeting */}
          <button
            type="button"
            onClick={onNavigateToMeetings}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-xl border border-primary/20 shadow-2xs transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            Schedule Meeting
          </button>

          {/* Action: Close Complaint Modal */}
          {!isClosed ? (
            <button
              type="button"
              onClick={onOpenClosureModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <FolderCheck className="w-3.5 h-3.5" />
              Close Complaint
            </button>
          ) : (
            onReopenRequest && (
              <button
                type="button"
                onClick={onReopenRequest}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reopen Case
              </button>
            )
          )}
        </div>
      </div>

      {/* Closed Banner if Case is Closed */}
      {isClosed && (
        <div className="bg-emerald-50/90 border border-emerald-300 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  CASE APPROVED FOR CLOSURE & ARCHIVED
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                  {complaint.finalStatus || 'Closed'}
                </span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Complaint approved for closure on <strong>{complaint.closureDate || 'N/A'}</strong> (Total turnaround time:{' '}
                <strong>{complaint.ageingClosed ?? 0} days</strong>). All corrective evidence and containment actions verified.
              </p>
              {complaint.remarks && (
                <p className="text-[11px] text-emerald-700 bg-white/80 p-2 rounded-lg border border-emerald-200 mt-1">
                  <strong>Remarks:</strong> {complaint.remarks}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
