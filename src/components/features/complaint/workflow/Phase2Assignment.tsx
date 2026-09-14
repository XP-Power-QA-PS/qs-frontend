import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Save,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSignature,
  Plus,
  ArrowRight,
} from 'lucide-react';
import type { ComplaintDetail, ComplaintMeeting, ComplaintUpdateRequest } from '@/types/complaint/complaint.types';

export interface Phase2AssignmentProps {
  complaint: ComplaintDetail;
  isUpdating: boolean;
  handleUpdatePhase: (data: ComplaintUpdateRequest, successMsg: string) => Promise<void>;
  setActiveTab: (tab: 'info' | 'meetings' | 'action') => void;
  setActiveWorkflowPhase: (phase: 2 | 3 | 4 | 5 | 6 | 7) => void;
  latestConcludedMeeting?: ComplaintMeeting;
}

export const Phase2Assignment: React.FC<Phase2AssignmentProps> = ({
  complaint,
  isUpdating,
  handleUpdatePhase,
  setActiveTab,
  setActiveWorkflowPhase,
  latestConcludedMeeting,
}) => {
  const navigate = useNavigate();

  const [assignmentData, setAssignmentData] = useState({
    assignedTeam: complaint.assignedTeam || '',
    assignedPerson: complaint.assignedPerson || '',
    priority: complaint.priority || 'MEDIUM',
    assignmentDeadline: complaint.assignmentDeadline || '',
  });

  useEffect(() => {
    setAssignmentData({
      assignedTeam: complaint.assignedTeam || '',
      assignedPerson: complaint.assignedPerson || '',
      priority: complaint.priority || 'MEDIUM',
      assignmentDeadline: complaint.assignmentDeadline || '',
    });
  }, [complaint]);

  return (
    <>
      {/* Left Column: Context */}
      <div className="lg:col-span-5 bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center text-xs">
              2
            </span>
            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Phase 2: CFT Preliminary Review & Assessment
              </h4>
              <span className="text-[11px] text-amber-800 font-semibold">SLA: 1 business day (24h)</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Preliminary Review
          </span>
        </div>

        <div className="p-3.5 bg-surface-canvas rounded-xl text-xs space-y-2 border border-border-subtle">
          <strong className="text-text-primary block">Business Objectives (IATF 16949):</strong>
          <p className="text-text-secondary leading-relaxed text-[11px]">
            Convene Cross-Functional Team (CFT: QA, Production, Engineering, Sourcing, Warehouse) within 24h of complaint intake to:
          </p>
          <ul className="list-disc pl-4 text-text-secondary text-[11px] space-y-1">
            <li>Verify complaint validity (Valid / Need comparative sample / Invalid).</li>
            <li><strong>Agree immediately on emergency containment actions</strong> to protect the customer.</li>
          </ul>
        </div>

        <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs space-y-1.5 text-amber-900">
          <strong className="block font-bold">Complaint Under Review:</strong>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>Model: <strong>{complaint.model}</strong></div>
            <div>Customer: <strong>{complaint.customerName}</strong></div>
            <div>Defect: <strong>{complaint.defectName || complaint.defectCategory}</strong></div>
            <div>Defect Qty: <strong>{complaint.quantity || 1} EA</strong></div>
          </div>
        </div>
      </div>

      {/* Right Column: Execution */}
      <div className="lg:col-span-7 space-y-6">
        {/* 2.1 Assignment & Priority Form (Workflow Step 2) */}
        <div className="bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-600" />
              Assign Team & Responsible Person (SLA: 1 Day)
            </h4>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              assignmentData.priority === 'HIGH'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : assignmentData.priority === 'LOW'
                ? 'bg-slate-50 text-slate-700 border-slate-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              Priority: {assignmentData.priority}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Team phụ trách (Assigned Team):
              </label>
              <input
                type="text"
                disabled={complaint.status === 'CLOSED'}
                value={assignmentData.assignedTeam}
                onChange={(e) => setAssignmentData((prev) => ({ ...prev, assignedTeam: e.target.value }))}
                placeholder="e.g., SMT Production, Quality Assurance..."
                className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-xl text-text-primary focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Người phụ trách chính (Responsible Person):
              </label>
              <input
                type="text"
                disabled={complaint.status === 'CLOSED'}
                value={assignmentData.assignedPerson}
                onChange={(e) => setAssignmentData((prev) => ({ ...prev, assignedPerson: e.target.value }))}
                placeholder="e.g., Nguyễn Văn A (CQE / Lead Engineer)..."
                className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-xl text-text-primary focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Mức độ ưu tiên (Priority):
              </label>
              <select
                disabled={complaint.status === 'CLOSED'}
                value={assignmentData.priority}
                onChange={(e) => setAssignmentData((prev) => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-xl text-text-primary focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="LOW">🟢 Low (Theo dõi thường kỳ)</option>
                <option value="MEDIUM">🟡 Medium (Tiêu chuẩn)</option>
                <option value="HIGH">🔴 High (Khẩn cấp / Dừng chuyền)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Hạn xử lý phân công (Deadline):
              </label>
              <input
                type="date"
                disabled={complaint.status === 'CLOSED'}
                value={assignmentData.assignmentDeadline}
                onChange={(e) => setAssignmentData((prev) => ({ ...prev, assignmentDeadline: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-xl text-text-primary disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-subtle">
            <button
              type="button"
              disabled={isUpdating || complaint.status === 'CLOSED'}
              onClick={() => {
                handleUpdatePhase(
                  {
                    assignedTeam: assignmentData.assignedTeam || undefined,
                    assignedPerson: assignmentData.assignedPerson || undefined,
                    priority: assignmentData.priority || 'MEDIUM',
                    assignmentDeadline: assignmentData.assignmentDeadline || undefined,
                  },
                  'Assignment information saved successfully!'
                );
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-border-subtle hover:bg-surface-canvas text-text-secondary text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-text-muted" />
              Save Assignment
            </button>
          </div>
        </div>

        {/* 2.2 CFT Meetings Card */}
        <div className="bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              CFT Meetings & Minutes Status
            </h4>
            <span className="text-xs text-text-muted">
              Conducted: <strong>{complaint.meetings?.length || 0}</strong> meetings
            </span>
          </div>

          {complaint.meetings && complaint.meetings.length > 0 ? (
            <div className="space-y-3">
              {complaint.meetings.map((m: ComplaintMeeting, idx: number) => (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    m.isConcluded ? 'bg-emerald-50/70 border-emerald-200' : 'bg-surface-canvas border-border-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary flex items-center gap-1.5">
                      #{idx + 1}. Date: {m.meetingDate} ({m.startTime} - {m.endTime || 'End'}) at {m.roomLocation}
                    </span>
                    {m.isConcluded ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Minutes Logged
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Scheduled / Awaiting Minutes
                      </span>
                    )}
                  </div>
                  {m.conclusion && (
                    <p className="text-[11px] text-text-primary bg-white p-2 rounded-lg border border-border-subtle/80">
                      <strong>Conclusion:</strong> {m.conclusion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 text-center space-y-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto" />
              <p>No CFT preliminary review meeting has been scheduled yet.</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setActiveTab('meetings')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <FileSignature className="w-4 h-4 text-amber-600" />
              Manage & Sign Meeting Minutes (Meetings Tab)
            </button>

            <button
              type="button"
              onClick={() => navigate(`/meeting-invite?complaintId=${complaint.id}`, { state: { complaint } })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border-subtle hover:bg-surface-canvas text-text-primary text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-primary" />
              Schedule New Meeting
            </button>

            {latestConcludedMeeting && (
              <button
                type="button"
                onClick={() => setActiveWorkflowPhase(3)}
                className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Advance to Phase 3: Containment
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
