import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  ShieldAlert,
  Search,
  CheckSquare,
  Save,
  AlertTriangle,
  Sparkles,
  Plus,
  FileSignature,
  Check,
  X,
  Edit3,
  ArrowRight,
  ShieldCheck,
  Copy,
  RotateCcw,
  Image as ImageIcon,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { complaintService } from '@/services/complaint/complaintService';
import type { ComplaintDetail, ComplaintUpdateRequest, ComplaintMeeting } from '@/types/complaint/complaint.types';
import { COMPLAINT_STAGE_META } from '@/types/complaint/complaint.types';
import { computeSlaStatus } from '@/utils/slaUtils';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Tab management: 'info' | 'action' | 'meetings'
  const initialTab = (searchParams.get('tab') as 'info' | 'action' | 'meetings') || 'info';
  const [activeTab, setActiveTab] = useState<'info' | 'action' | 'meetings'>(initialTab);

  const getInitialActivePhase = (status?: string): 2 | 3 | 4 | 5 | 6 | 7 => {
    switch (status) {
      case 'RECEIVED': return 2;
      case 'MEETING_SCHEDULED': return 3;
      case 'CONTAINMENT_COMMITTED': return 3;
      case 'ROOT_CAUSE_ANALYZED': return 4;
      case 'CAPA_COMMITTED': return 5;
      case 'EFFECTIVENESS_VERIFYING': return 6;
      case 'CLOSED': return 7;
      default: return 3;
    }
  };

  // Stage-Gate Workflow active view phase: 2 | 3 | 4 | 5 | 6 | 7
  const [activeWorkflowPhase, setActiveWorkflowPhase] = useState<2 | 3 | 4 | 5 | 6 | 7>(3);
  const [isInitialPhaseSet, setIsInitialPhaseSet] = useState<boolean>(false);

  // Conclude Meeting Modal State
  const [concludeModalMeeting, setConcludeModalMeeting] = useState<ComplaintMeeting | null>(null);
  const [concludeFormData, setConcludeFormData] = useState({
    conclusion: '',
    minutes: '',
    agreedContainment: '',
    transitionToContainment: true,
  });
  const [isSubmittingConclude, setIsSubmittingConclude] = useState<boolean>(false);

  // In-place phase update states
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string | null>(null);
  const [updateErrorMsg, setUpdateErrorMsg] = useState<string | null>(null);

  // Containment Data (3-Way Checklist & Clean Point)
  const [containmentData, setContainmentData] = useState({
    containmentAction: '',
    containmentDueDate: '',
    inHouseQty: '',
    inHouseRedTagged: true,
    customerQty: '',
    customerNotified: false,
    cleanPoint: '',
  });

  // Root Cause Data (5-Why Occurrence & Escape)
  const [rootCauseData, setRootCauseData] = useState({
    rootCause: '',
    occurrenceCause: '',
    escapeCause: '',
  });

  const [capaData, setCapaData] = useState({
    correctivePreventiveAction: '',
    correctiveAction: '',
    preventiveAction: '',
    actionOwner: '',
    actionDueDate: '',
    actionStatus: 'OPEN',
    evidenceDocumentation: '',
  });

  // Lightbox & Defect Pictures Modal State
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showEditPictureModal, setShowEditPictureModal] = useState<boolean>(false);
  const [editPictureUrls, setEditPictureUrls] = useState<string>('');
  const [isSavingPictures, setIsSavingPictures] = useState<boolean>(false);

  const parsePictureUrls = (urls?: string): string[] => {
    if (!urls) return [];
    return urls
      .split(/[\n,;]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:image/'));
  };

  const [closureData, setClosureData] = useState({
    closureDate: new Date().toISOString().slice(0, 10),
    finalStatus: 'ACCEPTED',
    remarks: '',
  });

  // Reopen Modal
  const [showReopenModal, setShowReopenModal] = useState<boolean>(false);
  const [reopenTargetStatus, setReopenTargetStatus] = useState<string>('ROOT_CAUSE_ANALYZED');
  const [reopenReason, setReopenReason] = useState<string>('');
  const [isSubmittingReopen, setIsSubmittingReopen] = useState<boolean>(false);

  const fetchDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);
    } catch (err: any) {
      console.error('Failed to load complaint detail', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (complaint) {
      setContainmentData((prev) => ({
        ...prev,
        containmentAction: complaint.containmentAction || '',
        containmentDueDate: complaint.containmentDueDate || '',
        inHouseQty: prev.inHouseQty || (complaint.quantity ? String(complaint.quantity) : ''),
      }));
      setRootCauseData((prev) => ({
        ...prev,
        rootCause: complaint.rootCause || '',
      }));

      // Parse corrective and preventive actions if structured (support both English and Vietnamese tags)
      let cAction = '';
      let pAction = '';
      if (complaint.correctivePreventiveAction) {
        const raw = complaint.correctivePreventiveAction;
        if (raw.includes('[Corrective') || raw.includes('[Preventive') || raw.includes('[Khắc phục') || raw.includes('[Phòng ngừa')) {
          const parts = raw.split(/\[(?:Preventive|Phòng ngừa)[^\]]*\]:/);
          if (parts[0]) {
            cAction = parts[0].replace(/\[(?:Corrective|Khắc phục)[^\]]*\]:/, '').trim();
          }
          if (parts[1]) {
            pAction = parts[1].trim();
          }
        } else {
          cAction = raw;
        }
      }

      // Parse action status and evidence documentation if structured (support both English and Vietnamese tags)
      let parsedActionStatus = complaint.actionStatus || 'OPEN';
      let parsedEvidence = '';
      if (complaint.actionStatus && (complaint.actionStatus.includes('[Evidence:') || complaint.actionStatus.includes('[Minh chứng:'))) {
        const match = complaint.actionStatus.match(/^(.*?)\s*\|\s*\[(?:Evidence|Minh chứng):\s*(.*?)\]$/);
        if (match) {
          parsedActionStatus = match[1].trim();
          parsedEvidence = match[2].trim();
        } else {
          const parts = complaint.actionStatus.split(/\|\s*\[(?:Evidence|Minh chứng):\s*/);
          parsedActionStatus = parts[0].trim();
          if (parts[1]) {
            parsedEvidence = parts[1].replace(/\]$/, '').trim();
          }
        }
      }

      setCapaData({
        correctivePreventiveAction: complaint.correctivePreventiveAction || '',
        correctiveAction: cAction,
        preventiveAction: pAction,
        actionOwner: complaint.actionOwner || '',
        actionDueDate: complaint.actionDueDate || '',
        actionStatus: parsedActionStatus,
        evidenceDocumentation: parsedEvidence,
      });
      setEditPictureUrls(complaint.pictureUrls || '');
      setClosureData({
        closureDate: complaint.closureDate || new Date().toISOString().slice(0, 10),
        finalStatus: complaint.finalStatus || 'ACCEPTED',
        remarks: complaint.remarks || '',
      });

      // Only set initial active phase once on first load
      if (!isInitialPhaseSet) {
        setActiveWorkflowPhase(getInitialActivePhase(complaint.status));
        setIsInitialPhaseSet(true);
      }
    }
  }, [complaint, isInitialPhaseSet]);

  const handleSavePictures = async () => {
    if (!complaint) return;
    setIsSavingPictures(true);
    try {
      const updated = await complaintService.updateComplaint(complaint.id, {
        pictureUrls: editPictureUrls.trim() || undefined,
      });
      setComplaint(updated);
      setShowEditPictureModal(false);
      setUpdateSuccessMsg('Defect picture URLs updated successfully!');
      setTimeout(() => setUpdateSuccessMsg(null), 4000);
    } catch (err: any) {
      setUpdateErrorMsg(err.message || 'Failed to update defect pictures. Please try again.');
    } finally {
      setIsSavingPictures(false);
    }
  };

  const handleUpdatePhase = async (
    payload: ComplaintUpdateRequest,
    successMessage: string,
    nextPhase?: 2 | 3 | 4 | 5 | 6 | 7
  ) => {
    if (!complaint) return;
    setIsUpdating(true);
    setUpdateSuccessMsg(null);
    setUpdateErrorMsg(null);
    try {
      const updated = await complaintService.updateComplaint(complaint.id, payload);
      setComplaint(updated);
      if (nextPhase) {
        setActiveWorkflowPhase(nextPhase);
      }
      setUpdateSuccessMsg(successMessage);
      setTimeout(() => setUpdateSuccessMsg(null), 5000);
    } catch (err: any) {
      setUpdateErrorMsg(err.message || 'Update failed. Please check your network connection.');
    } finally {
      setIsUpdating(false);
    }
  };

  const openConcludeModal = (meeting: ComplaintMeeting) => {
    setConcludeModalMeeting(meeting);
    setConcludeFormData({
      conclusion: meeting.conclusion || 'VALID Complaint - Immediate Containment required within 48h',
      minutes: meeting.minutes || '',
      agreedContainment: meeting.agreedContainment || complaint?.containmentAction || '',
      transitionToContainment: true,
    });
  };

  const handleConcludeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !concludeModalMeeting) return;
    if (!concludeFormData.conclusion.trim()) {
      alert('Please enter meeting conclusion.');
      return;
    }

    setIsSubmittingConclude(true);
    try {
      const updated = await complaintService.concludeMeetingForComplaint(
        complaint.id,
        concludeModalMeeting.id,
        concludeFormData
      );
      setComplaint(updated);
      setUpdateSuccessMsg('Meeting concluded and minutes logged successfully!');
      setTimeout(() => setUpdateSuccessMsg(null), 5000);
      setConcludeModalMeeting(null);
    } catch (err: any) {
      alert('Error logging meeting minutes: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmittingConclude(false);
    }
  };

  const handleReopenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    if (!reopenReason.trim()) {
      alert('Please enter reason for reopening the case (e.g., Defect recurrence in new production batch, customer rejected 8D report...)');
      return;
    }
    setIsSubmittingReopen(true);
    try {
      const updated = await complaintService.updateComplaint(complaint.id, {
        status: reopenTargetStatus as any,
        remarks: `[REOPENED ON ${new Date().toLocaleDateString('en-US')}]: ${reopenReason}\n\n${complaint.remarks || ''}`,
      });
      setComplaint(updated);
      setShowReopenModal(false);
      setReopenReason('');
      setUpdateSuccessMsg('Complaint case successfully reopened! Status reset to active investigation.');
      setTimeout(() => setUpdateSuccessMsg(null), 5000);
      setActiveWorkflowPhase(getInitialActivePhase(reopenTargetStatus));
    } catch (err: any) {
      alert('Error reopening case: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmittingReopen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-text-muted">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mb-2"></div>
        <p className="text-xs">Loading complaint record...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-text-primary">Complaint Record Not Found</h2>
        <Link
          to="/complaints"
          className="inline-flex items-center gap-2 text-xs text-primary font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to complaint list
        </Link>
      </div>
    );
  }

  const stageMeta = COMPLAINT_STAGE_META[complaint.status];
  const slaInfo = computeSlaStatus(complaint);

  const isPhase6Verified =
    complaint.status === 'CLOSED' ||
    (complaint.status === 'EFFECTIVENESS_VERIFYING' &&
      (complaint.actionStatus?.includes('VERIFIED') ||
        complaint.actionStatus?.includes('[Minh chứng:') ||
        complaint.actionStatus?.includes('[Evidence:') ||
        activeWorkflowPhase === 7));

  // Jeanette 7-Step Milestones
  const steps = [
    { num: 1, name: 'Intake', key: 'RECEIVED', sla: '0d' },
    { num: 2, name: 'CFT Review', key: 'MEETING_SCHEDULED', sla: '1d' },
    { num: 3, name: 'Containment', key: 'CONTAINMENT_COMMITTED', sla: '2d' },
    { num: 4, name: 'Root Cause', key: 'ROOT_CAUSE_ANALYZED', sla: '5d' },
    { num: 5, name: 'CAPA Plan', key: 'CAPA_COMMITTED', sla: '10d' },
    { num: 6, name: 'Verification', key: 'EFFECTIVENESS_VERIFYING', sla: '30d' },
    { num: 7, name: 'Case Closure', key: 'CLOSED', sla: 'Finish' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === complaint.status);
  const effectiveStepIndex = complaint.status === 'CLOSED' ? 6 : isPhase6Verified ? 6 : currentStepIndex;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/complaints')}
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
            onClick={() => {
              setActiveTab('action');
              setActiveWorkflowPhase(getInitialActivePhase(complaint.status));
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-xl border border-primary/20 shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            8D Stage-Gate & Verification
          </button>

          <button
            onClick={() => navigate(`/meeting-invite?complaintId=${complaint.id}`, { state: { complaint } })}
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
              onClick={() => setShowReopenModal(true)}
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

      {/* Success / Error Message Banners for Actions */}
      {updateSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-xs flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold">{updateSuccessMsg}</p>
        </div>
      )}

      {updateErrorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 shadow-xs flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs font-semibold">{updateErrorMsg}</p>
        </div>
      )}

      {/* Jeanette 7-Step Process Stepper (Clickable to switch tab) */}
      <div className="bg-white border border-border-subtle p-4 sm:p-5 rounded-2xl shadow-2xs">
        <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Jeanette Quality SLA Process Flow
          </span>
          <div className="flex items-center gap-2">
            <span className="text-text-muted font-normal text-[10px] sm:text-[11px] normal-case">
              Click any step to open corresponding tab & phase workflow
            </span>
            <span className="text-primary font-semibold lowercase text-xs">
              {stageMeta.sla}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 relative">
          {steps.map((step, idx) => {
            const isCompleted = idx < effectiveStepIndex || complaint.status === 'CLOSED';
            const isCurrent = idx === effectiveStepIndex && complaint.status !== 'CLOSED';
            const isSelected =
              (step.num === 1 && activeTab === 'info') ||
              (step.num === 2 && (activeTab === 'meetings' || (activeTab === 'action' && activeWorkflowPhase === 2))) ||
              (activeTab === 'action' && activeWorkflowPhase === step.num);

            return (
              <div
                key={step.num}
                onClick={() => {
                  if (step.num === 1) {
                    setActiveTab('info');
                  } else if (step.num === 2) {
                    setActiveTab('meetings');
                  } else {
                    setActiveTab('action');
                    setActiveWorkflowPhase(step.num as any);
                  }
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer hover:shadow-xs relative ${
                  isSelected
                    ? complaint.status === 'CLOSED' || isCompleted
                      ? 'bg-emerald-100/90 border-emerald-500 ring-2 ring-emerald-500/80 shadow-xs'
                      : isCurrent
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500 shadow-xs'
                      : 'bg-primary/10 border-primary ring-2 ring-primary shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800 hover:bg-emerald-100/60'
                    : isCurrent
                    ? 'bg-amber-50/70 border-amber-300 text-amber-900 ring-1 ring-amber-400/50 hover:bg-amber-100/60'
                    : 'bg-surface-canvas border-border-subtle text-text-muted opacity-70 hover:opacity-100 hover:bg-surface-subtle'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1">
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span
                        className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                          isCurrent
                            ? 'bg-amber-500 text-white animate-pulse'
                            : 'bg-surface-subtle text-text-secondary'
                        }`}
                      >
                        {step.num}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <span
                      className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tighter ${
                        complaint.status === 'CLOSED' || isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-amber-600 text-white'
                          : 'bg-primary text-white'
                      }`}
                    >
                      Viewing
                    </span>
                  )}
                </div>
                <div
                  className={`text-[11px] font-semibold truncate ${
                    isSelected
                      ? complaint.status === 'CLOSED' || isCompleted
                        ? 'text-emerald-950 font-bold'
                        : isCurrent
                        ? 'text-amber-950 font-bold'
                        : 'text-primary font-bold'
                      : isCurrent
                      ? 'text-amber-900 font-bold'
                      : isCompleted
                      ? 'text-emerald-900'
                      : 'text-text-secondary'
                  }`}
                >
                  {step.name}
                </div>
                <div className="text-[9px] text-text-muted mt-0.5">SLA: {step.sla}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-subtle gap-4">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'info'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Detailed Information (7 CAPA Template Groups)
        </button>

        <button
          onClick={() => setActiveTab('meetings')}
          className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'meetings'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          CFT Review Meetings & Minutes
          {complaint.meetings && complaint.meetings.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
              {complaint.meetings.length} ({complaint.meetings.filter((m) => m.isConcluded).length} concluded)
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('action')}
          className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'action'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          8D Stage-Gate Execution & Verification
        </button>
      </div>

      {/* Tab 1: Detailed 7-Group CAPA Info */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col 1 & 2: Primary Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Group 1 & 4: Issue Description & Defect */}
            <div className="bg-white border border-border-subtle p-5 rounded-2xl shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Defect & Product Information
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-surface-canvas rounded-xl text-xs">
                <div>
                  <span className="text-text-muted text-[11px] block">Model</span>
                  <strong className="text-text-primary font-mono">{complaint.model}</strong>
                </div>
                <div>
                  <span className="text-text-muted text-[11px] block">Defect Category</span>
                  <strong className="text-text-primary">{complaint.defectCategory || 'Uncategorized'}</strong>
                </div>
                <div>
                  <span className="text-text-muted text-[11px] block">Defect Name</span>
                  <strong className="text-rose-600">{complaint.defectName || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-text-muted text-[11px] block">Affected Quantity</span>
                  <strong className="text-text-primary">{complaint.quantity || 1} EA</strong>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-text-secondary block mb-1">
                  Issue Description:
                </span>
                <p className="text-xs text-text-primary bg-surface-canvas p-3 rounded-xl leading-relaxed whitespace-pre-wrap border border-border-subtle">
                  {complaint.issueDescription}
                </p>
              </div>

              {complaint.customerFinding && (
                <div>
                  <span className="text-xs font-semibold text-text-secondary block mb-1">
                    Customer Finding / Feedback:
                  </span>
                  <p className="text-xs text-text-primary bg-amber-50/50 p-3 rounded-xl leading-relaxed border border-amber-200/50">
                    {complaint.customerFinding}
                  </p>
                </div>
              )}

              {complaint.serialNumbers && (
                <div>
                  <span className="text-[11px] font-semibold text-text-muted block mb-0.5">
                    Serial Numbers (SN):
                  </span>
                  <code className="text-xs bg-surface-canvas px-2.5 py-1 rounded-md border border-border-subtle block font-mono">
                    {complaint.serialNumbers}
                  </code>
                </div>
              )}
            </div>

            {/* Group: Defect Pictures */}
            <div className="bg-white border border-border-subtle p-5 rounded-2xl shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Defect Pictures & Evidence
                  {parsePictureUrls(complaint.pictureUrls).length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                      {parsePictureUrls(complaint.pictureUrls).length} photos
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditPictureUrls(complaint.pictureUrls || '');
                    setShowEditPictureModal(true);
                  }}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {parsePictureUrls(complaint.pictureUrls).length > 0 ? 'Update photo URLs' : 'Add photo URLs'}
                </button>
              </div>

              {parsePictureUrls(complaint.pictureUrls).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {parsePictureUrls(complaint.pictureUrls).map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-video rounded-xl overflow-hidden border border-border-subtle bg-surface-canvas shadow-2xs hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setPreviewImageUrl(url)}
                    >
                      <img
                        src={url}
                        alt={`Defect photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%2394a3b8" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="p-1.5 bg-white/90 text-slate-800 rounded-lg shadow-xs hover:bg-white transition-colors">
                          <Maximize2 className="w-4 h-4" />
                        </span>
                      </div>
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => {
                    setEditPictureUrls(complaint.pictureUrls || '');
                    setShowEditPictureModal(true);
                  }}
                  className="p-6 border-2 border-dashed border-border-subtle rounded-xl text-center bg-surface-canvas/50 hover:bg-surface-canvas transition-colors cursor-pointer space-y-1.5"
                >
                  <ImageIcon className="w-7 h-7 text-text-muted mx-auto" />
                  <p className="text-xs font-semibold text-text-secondary">No defect images attached yet</p>
                  <p className="text-[11px] text-text-muted">
                    Click here to paste direct image links or defect inspection photo URLs
                  </p>
                </div>
              )}
            </div>

            {/* Group 5: Root Cause & CAPA Actions */}
            <div className="bg-white border border-border-subtle p-5 rounded-2xl shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Corrective & Preventive Action Plan (CAPA / 8D)
                </h3>
                <button
                  onClick={() => setActiveTab('action')}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Edit / Update Actions
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Containment */}
                <div className="p-3.5 border border-border-subtle rounded-xl bg-surface-canvas">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-text-primary">1. Containment Action (Interim Containment):</strong>
                    <span className="text-[11px] text-text-muted">
                      Due: {complaint.containmentDueDate || 'SLA 2 days'}
                    </span>
                  </div>
                  <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {complaint.containmentAction || 'Not updated yet (Click "8D Stage-Gate" tab to record)'}
                  </p>
                </div>

                {/* Root Cause */}
                <div className="p-3.5 border border-border-subtle rounded-xl bg-surface-canvas">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-text-primary">2. Root Cause (5-Why Root Cause Analysis):</strong>
                    <span className="text-[11px] text-text-muted">SLA: 5 days</span>
                  </div>
                  <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {complaint.rootCause || 'Under investigation... (Click "8D Stage-Gate" tab to record)'}
                  </p>
                </div>

                {/* CAPA */}
                <div className="p-3.5 border border-border-subtle rounded-xl bg-surface-canvas">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-text-primary">3. Corrective & Preventive Action (CAPA):</strong>
                    <span className="text-[11px] text-text-muted">
                      Due: {complaint.actionDueDate || 'SLA 10 days'} {complaint.actionOwner ? `• Owner: ${complaint.actionOwner}` : ''}
                    </span>
                  </div>
                  <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {complaint.correctivePreventiveAction || 'Awaiting root cause verification'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Metadata & Identification */}
          <div className="space-y-6">
            <div className="bg-white border border-border-subtle p-5 rounded-2xl shadow-2xs space-y-3.5 text-xs">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Identification & Timeline
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-text-muted">Tracking No:</span>
                  <span className="font-mono font-bold text-primary">{complaint.trackingNo}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-text-muted">Year / Month:</span>
                  <span className="font-semibold text-text-primary">Year {complaint.year} (Month {complaint.month})</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-text-muted">Week:</span>
                  <span className="font-semibold text-text-primary">Week #{complaint.week || '-'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-text-muted">Stage:</span>
                  <span className="font-semibold text-text-primary">{complaint.buildingStage || 'MP'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-text-muted">Classification:</span>
                  <span className="font-semibold text-text-primary">{complaint.internalExternal}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-text-muted">Origin of Complaint:</span>
                  <span className="font-semibold text-text-primary">{complaint.originOfComplaint || 'Customer'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-text-muted">Ageing Open:</span>
                  <span className="font-semibold text-amber-600">
                    {complaint.ageingOpen != null ? `${complaint.ageingOpen} days` : '-'}
                  </span>
                </div>
                {complaint.closureDate && (
                  <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                    <span className="text-text-muted">Closure Date:</span>
                    <span className="font-semibold text-emerald-600">{complaint.closureDate}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1">
                  <span className="text-text-muted">Created By:</span>
                  <span className="font-semibold text-text-primary">{complaint.createdBy}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: CFT Meetings Management & Minutes */}
      {activeTab === 'meetings' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-border-subtle p-5 rounded-2xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 font-bold">
                  <Calendar className="w-5 h-5" />
                </span>
                <h3 className="text-sm font-bold text-text-primary">
                  Cross-Functional Team (CFT) Review Meetings
                </h3>
              </div>
              <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
                Upon complaint intake, the quality team can convene <strong>multiple CFT meetings</strong> (preliminary review, containment alignment, emergency review). Once a meeting completes, the organizer clicks <strong>"Confirm & Conclude"</strong> to document Minutes, Conclusions, and agreed Containment actions.
              </p>
            </div>

            <button
              onClick={() => navigate(`/meeting-invite?complaintId=${complaint.id}`, { state: { complaint } })}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-container text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Schedule New CFT Meeting
            </button>
          </div>

          {/* Meeting Cards List */}
          {(!complaint.meetings || complaint.meetings.length === 0) ? (
            <div className="bg-white border border-border-subtle rounded-2xl p-12 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">No CFT meetings recorded yet</h3>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                This complaint has no preliminary CFT review scheduled yet. Click below to dispatch email invitations and calendar .ics files to the team.
              </p>
              <button
                onClick={() => navigate(`/meeting-invite?complaintId=${complaint.id}`, { state: { complaint } })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-container text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Schedule First Review Meeting Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {complaint.meetings.map((m, index) => (
                <div
                  key={m.id}
                  className={`bg-white border rounded-2xl p-5 shadow-2xs space-y-4 transition-all ${
                    m.isConcluded ? 'border-emerald-200 ring-1 ring-emerald-500/10' : 'border-border-subtle'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border-subtle pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          m.isConcluded
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-text-primary">
                            Review Meeting: {m.meetingDate} ({m.startTime} - {m.endTime || 'End'})
                          </h4>
                          {m.isConcluded ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Concluded & Minutes Logged
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Scheduled / Awaiting Meeting
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          Location: <strong className="text-text-secondary">{m.roomLocation}</strong> • Organizer: <strong className="text-text-secondary">{m.organizerEmail}</strong>
                        </p>
                      </div>
                    </div>

                    <div>
                      {m.isConcluded ? (
                        <button
                          onClick={() => openConcludeModal(m)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-canvas hover:bg-surface-subtle text-text-secondary border border-border-subtle rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit Minutes
                        </button>
                      ) : (
                        <button
                          onClick={() => openConcludeModal(m)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-98 cursor-pointer"
                        >
                          <FileSignature className="w-3.5 h-3.5" />
                          Confirm Concluded & Enter Minutes
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Agenda */}
                  <div>
                    <span className="text-[11px] font-semibold text-text-muted block mb-1">
                      Meeting Agenda:
                    </span>
                    <p className="text-xs text-text-primary bg-surface-canvas p-3 rounded-xl whitespace-pre-wrap border border-border-subtle leading-relaxed font-sans">
                      {m.agenda}
                    </p>
                  </div>

                  {/* Concluded Minutes & Actions */}
                  {m.isConcluded ? (
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-emerald-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Meeting Outcomes & Conclusion:
                        </div>
                        <span className="text-[11px] text-emerald-700 font-medium">
                          Confirmed by: <strong>{m.concludedBy || 'System'}</strong>{' '}
                          {m.concludedAt ? `on ${new Date(m.concludedAt).toLocaleDateString('en-US')}` : ''}
                        </span>
                      </div>

                      <div className="p-2.5 bg-white rounded-lg border border-emerald-200/80">
                        <strong className="text-emerald-950 font-semibold block mb-0.5">Key Conclusion:</strong>
                        <p className="text-text-primary leading-relaxed font-medium">{m.conclusion || 'Meeting completed'}</p>
                      </div>

                      {m.minutes && (
                        <div>
                          <strong className="text-emerald-950 font-semibold block mb-0.5">Meeting Minutes:</strong>
                          <p className="text-text-secondary leading-relaxed bg-white/70 p-2.5 rounded-lg whitespace-pre-wrap border border-emerald-100 font-sans">
                            {m.minutes}
                          </p>
                        </div>
                      )}

                      {m.agreedContainment && (
                        <div>
                          <strong className="text-emerald-950 font-semibold block mb-0.5">Agreed Containment Action:</strong>
                          <p className="text-text-secondary leading-relaxed bg-white/70 p-2.5 rounded-lg whitespace-pre-wrap border border-emerald-100 font-sans">
                            {m.agreedContainment}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>CFT meeting invite dispatched. Once the meeting concludes, confirm to record minutes and activate subsequent containment stage.</span>
                      </div>
                      <button
                        onClick={() => openConcludeModal(m)}
                        className="text-amber-800 hover:text-amber-950 font-bold underline shrink-0 cursor-pointer text-xs"
                      >
                        Enter conclusion now &rarr;
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Stage-Gate Incident Workflow (IATF 16949 / 8D / Jeanette SLA) */}
      {activeTab === 'action' && (() => {
        const workflowPhases: Array<{
          num: 2 | 3 | 4 | 5 | 6 | 7;
          title: string;
          name: string;
          sla: string;
          statusKey: string;
        }> = [
          { num: 2, title: 'CFT Review', name: 'Phase 2: CFT Review', sla: '1d', statusKey: 'MEETING_SCHEDULED' },
          { num: 3, title: '3-Way Containment', name: 'Phase 3: Containment', sla: '2d (48h)', statusKey: 'CONTAINMENT_COMMITTED' },
          { num: 4, title: '5-Why Root Cause', name: 'Phase 4: Root Cause', sla: '5d', statusKey: 'ROOT_CAUSE_ANALYZED' },
          { num: 5, title: 'CAPA Plan', name: 'Phase 5: CAPA Plan', sla: '10d', statusKey: 'CAPA_COMMITTED' },
          { num: 6, title: '30-Day Verification', name: 'Phase 6: Verification', sla: '30d', statusKey: 'EFFECTIVENESS_VERIFYING' },
          { num: 7, title: '8D Case Closure', name: 'Phase 7: Case Closure', sla: 'Finish', statusKey: 'CLOSED' },
        ];

        const stageOrder: Record<string, number> = {
          RECEIVED: 1,
          MEETING_SCHEDULED: 2,
          CONTAINMENT_COMMITTED: 3,
          ROOT_CAUSE_ANALYZED: 4,
          CAPA_COMMITTED: 5,
          EFFECTIVENESS_VERIFYING: 6,
          CLOSED: 7,
        };
        const currentComplaintStageNum = stageOrder[complaint.status] || 1;
        const latestConcludedMeeting = complaint.meetings?.find((m) => m.isConcluded) || complaint.meetings?.[0];

        return (
          <div className="space-y-6">
            {/* Compact Phase Navigation Header (Streamlined & Non-Redundant) */}
            <div className="bg-white border border-border-subtle px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                  {activeWorkflowPhase}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      {workflowPhases.find((p) => p.num === activeWorkflowPhase)?.title || `Phase ${activeWorkflowPhase}`}
                    </h3>
                    <span className="text-[11px] text-text-muted">
                      • SLA: <strong className="text-primary">{workflowPhases.find((p) => p.num === activeWorkflowPhase)?.sla}</strong>
                    </span>
                  </div>
                </div>
                {complaint.status === 'CLOSED' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Completed
                  </span>
                ) : isPhase6Verified && activeWorkflowPhase === 7 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    Ready for Closure
                  </span>
                ) : activeWorkflowPhase < currentComplaintStageNum ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Stage Completed
                  </span>
                ) : activeWorkflowPhase === currentComplaintStageNum ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                    In Progress & Verification
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-subtle text-text-muted border border-border-subtle">
                    Pending
                  </span>
                )}
              </div>

              {/* Fast Phase Switcher Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 shrink-0">
                <span className="text-[11px] text-text-muted font-medium mr-1 hidden md:inline">Switch Phase:</span>
                {workflowPhases.map((phase) => {
                  const isPhaseActive = activeWorkflowPhase === phase.num;
                  const isPhaseDone =
                    complaint.status === 'CLOSED'
                      ? true
                      : isPhase6Verified
                      ? phase.num <= 6
                      : phase.num < currentComplaintStageNum;

                  return (
                    <button
                      key={phase.num}
                      type="button"
                      onClick={() => setActiveWorkflowPhase(phase.num)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isPhaseActive
                          ? 'bg-primary text-white shadow-xs ring-2 ring-primary/20'
                          : isPhaseDone
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-surface-canvas border border-border-subtle text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                      }`}
                    >
                      <span>Phase {phase.num}</span>
                      {isPhaseDone && !isPhaseActive && (
                        <Check className="w-3 h-3 text-emerald-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2-Column Responsive Split Layout (Context Left vs Action Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ============================================================ */}
              {/* PHASE 2: CFT PRELIMINARY REVIEW                              */}
              {/* ============================================================ */}
              {activeWorkflowPhase === 2 && (
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
                  <div className="lg:col-span-7 bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
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
                        {complaint.meetings.map((m, idx) => (
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
                </>
              )}

              {/* ============================================================ */}
              {/* PHASE 3: CONTAINMENT EXECUTION                               */}
              {/* ============================================================ */}
              {activeWorkflowPhase === 3 && (
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

                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">
                        Containment Target Due Date:
                      </label>
                      <input
                        type="date"
                        disabled={complaint.status === 'CLOSED'}
                        value={containmentData.containmentDueDate}
                        onChange={(e) => setContainmentData((prev) => ({ ...prev, containmentDueDate: e.target.value }))}
                        className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary disabled:opacity-60 disabled:cursor-not-allowed"
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
              )}

              {/* ============================================================ */}
              {/* PHASE 4: ROOT CAUSE ANALYSIS (5-WHY)                         */}
              {/* ============================================================ */}
              {activeWorkflowPhase === 4 && (
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
                          disabled={isUpdating || !rootCauseData.rootCause.trim()}
                          onClick={() =>
                            handleUpdatePhase(
                              {
                                rootCause: rootCauseData.rootCause,
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
              )}

              {/* ============================================================ */}
              {/* PHASE 5: CAPA PLAN (D5 & D6)                                 */}
              {/* ============================================================ */}
              {activeWorkflowPhase === 5 && (
                <>
                  {/* Left Column: Context */}
                  <div className="lg:col-span-5 bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                          5
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                            Phase 5: Corrective & Preventive Actions (D5-D6)
                          </h4>
                          <span className="text-[11px] text-purple-800 font-semibold">SLA: 10 Business Days</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                        8D - Steps D5 & D6
                      </span>
                    </div>

                    {/* Evidence from Phase 4 */}
                    <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl text-xs space-y-1.5 text-purple-950">
                      <strong className="font-bold flex items-center gap-1.5 text-purple-900">
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                        Approved Root Cause (D4 Baseline):
                      </strong>
                      <p className="bg-white p-2.5 rounded-lg border border-purple-200 text-[11px] text-text-primary whitespace-pre-wrap">
                        {complaint.rootCause || 'Root cause analyzed'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-surface-canvas rounded-xl text-xs space-y-1.5 border border-border-subtle">
                      <strong className="text-text-primary block text-[11px]">IATF 16949 CAPA Effectiveness Criteria:</strong>
                      <ul className="list-disc pl-4 text-text-secondary text-[11px] space-y-1">
                        <li><strong>Corrective:</strong> Eliminate root cause of occurrence and escape mechanism.</li>
                        <li><strong>Preventive:</strong> Horizontal rollout (Yokoten) to other models, tools, and lines.</li>
                        <li>Specific Action Owner and committed target Due Date must be assigned.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Right Column: Execution Form */}
                  <div className="lg:col-span-7 bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                      <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-purple-600" />
                        CAPA Plan Commitment & Execution
                      </h4>
                      <span className="text-[11px] font-semibold text-purple-700">
                        {complaint.correctivePreventiveAction ? 'CAPA Committed' : 'Pending'}
                      </span>
                    </div>

                    {/* 2-Branch Inputs: Corrective vs Preventive */}
                    <div className="space-y-3 p-3.5 bg-surface-canvas rounded-xl border border-border-subtle">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                          2-Branch CAPA Structure (IATF 16949 Compliant):
                        </span>
                        {complaint.status !== 'CLOSED' && (capaData.correctiveAction || capaData.preventiveAction) && (
                          <button
                            type="button"
                            onClick={() => {
                              const combined = [
                                capaData.correctiveAction ? `[Corrective]: ${capaData.correctiveAction}` : '',
                                capaData.preventiveAction ? `[Preventive]: ${capaData.preventiveAction}` : '',
                              ].filter(Boolean).join('\n\n');
                              setCapaData((prev) => ({ ...prev, correctivePreventiveAction: combined }));
                            }}
                            className="text-[11px] text-purple-700 hover:text-purple-900 font-bold underline cursor-pointer"
                          >
                            Merge both branches into CAPA Plan &rarr;
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Branch 1: Corrective */}
                        <div className="space-y-1 bg-white p-3 rounded-lg border border-border-subtle">
                          <label className="block text-[11px] font-bold text-purple-900">
                            1. Direct Corrective Action (Eliminate Occurrence):
                          </label>
                          <span className="text-[10px] text-text-muted block">
                            Eliminate root cause, rework affected batch, prevent recurrence on this product.
                          </span>
                          <textarea
                            rows={3}
                            disabled={complaint.status === 'CLOSED'}
                            value={capaData.correctiveAction}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCapaData((prev) => {
                                const next = { ...prev, correctiveAction: val };
                                if (!prev.correctivePreventiveAction.includes('[Preventive') && !prev.correctivePreventiveAction.includes('[Phòng ngừa') && !prev.preventiveAction) {
                                  next.correctivePreventiveAction = val;
                                }
                                return next;
                              });
                            }}
                            placeholder="e.g., Re-calibrate reflow oven thermal profile; replace solder wire with verified SAC305 batch..."
                            className="w-full px-2.5 py-1.5 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:ring-1 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed font-sans"
                          />
                        </div>

                        {/* Branch 2: Preventive / Yokoten */}
                        <div className="space-y-1 bg-white p-3 rounded-lg border border-border-subtle">
                          <label className="block text-[11px] font-bold text-indigo-900">
                            2. Preventive & Yokoten Action (Systemic & Horizontal):
                          </label>
                          <span className="text-[10px] text-text-muted block">
                            Systemic improvements: update PFMEA / Control Plan, deploy cross-line Yokoten to similar products.
                          </span>
                          <textarea
                            rows={3}
                            disabled={complaint.status === 'CLOSED'}
                            value={capaData.preventiveAction}
                            onChange={(e) => setCapaData((prev) => ({ ...prev, preventiveAction: e.target.value }))}
                            placeholder="e.g., Update PFMEA item #14; add per-shift thermocouple check checklist for remaining 5 lines..."
                            className="w-full px-2.5 py-1.5 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed font-sans"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Synthesized Textarea */}
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">
                        Comprehensive CAPA Action Plan Summary <span className="text-rose-500">*</span>:
                      </label>
                      <textarea
                        rows={3}
                        disabled={complaint.status === 'CLOSED'}
                        value={capaData.correctivePreventiveAction}
                        onChange={(e) => setCapaData((prev) => ({ ...prev, correctivePreventiveAction: e.target.value }))}
                        placeholder="e.g., Replace thermocouple with anti-oxidation probe; implement automated optical inspection (AOI) check..."
                        className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-sans disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          Action Owner:
                        </label>
                        <input
                          type="text"
                          disabled={complaint.status === 'CLOSED'}
                          value={capaData.actionOwner}
                          onChange={(e) => setCapaData((prev) => ({ ...prev, actionOwner: e.target.value }))}
                          placeholder="e.g., John Doe (Process Engineering)"
                          className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          Committed Completion Due Date:
                        </label>
                        <input
                          type="date"
                          disabled={complaint.status === 'CLOSED'}
                          value={capaData.actionDueDate}
                          onChange={(e) => setCapaData((prev) => ({ ...prev, actionDueDate: e.target.value }))}
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
                          disabled={isUpdating || !capaData.correctivePreventiveAction.trim()}
                          onClick={() =>
                            handleUpdatePhase(
                              {
                                correctivePreventiveAction: capaData.correctivePreventiveAction,
                                actionOwner: capaData.actionOwner || undefined,
                                actionDueDate: capaData.actionDueDate || undefined,
                                actionStatus: 'IN_PROGRESS',
                                status: 'CAPA_COMMITTED',
                              },
                              'CAPA action plan saved successfully!'
                            )
                          }
                          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border-subtle hover:bg-surface-canvas text-text-secondary text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
                        >
                          <Save className="w-4 h-4 text-text-muted" />
                          Save CAPA Plan
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating || !capaData.correctivePreventiveAction.trim()}
                          onClick={() => {
                            handleUpdatePhase(
                              {
                                correctivePreventiveAction: capaData.correctivePreventiveAction,
                                actionOwner: capaData.actionOwner || undefined,
                                actionDueDate: capaData.actionDueDate || undefined,
                                actionStatus: 'EFFECTIVENESS_VERIFYING',
                                status: 'EFFECTIVENESS_VERIFYING',
                              },
                              'CAPA plan committed! Phase 6 (30-day Effectiveness Verification) initiated.',
                              6
                            );
                          }}
                          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Commit CAPA & Proceed to Phase 6 &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ============================================================ */}
              {/* PHASE 6: EFFECTIVENESS VERIFICATION (D7 - 30 DAYS)           */}
              {/* ============================================================ */}
              {activeWorkflowPhase === 6 && (
                <>
                  {/* Left Column: Context */}
                  <div className="lg:col-span-5 bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                          6
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                            Phase 6: 30-Day Effectiveness Verification (D7)
                          </h4>
                          <span className="text-[11px] text-teal-800 font-semibold">SLA: 30-Day Monitoring Period</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        8D - Step D7
                      </span>
                    </div>

                    {/* Evidence from Phase 5 */}
                    <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-xl text-xs space-y-1.5 text-teal-950">
                      <strong className="font-bold flex items-center gap-1.5 text-teal-900">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        Active CAPA Plan Under Monitoring:
                      </strong>
                      <p className="bg-white p-2.5 rounded-lg border border-teal-200 text-[11px] text-text-primary whitespace-pre-wrap">
                        {complaint.correctivePreventiveAction || 'CAPA implementation in progress'}
                      </p>
                      <p className="text-[11px] text-teal-800 pt-1">
                        Owner: <strong>{complaint.actionOwner || 'N/A'}</strong> (Due: {complaint.actionDueDate || 'Not set'})
                      </p>
                    </div>

                    <div className="p-3.5 bg-surface-canvas rounded-xl text-xs space-y-1.5 border border-border-subtle">
                      <strong className="text-text-primary block text-[11px]">IATF Step D7 Verification Criteria:</strong>
                      <p className="text-text-secondary text-[11px] leading-relaxed">
                        Continuously monitor subsequent production runs over at least 30 days. Ensure defect rate (PPM) = 0 with zero recurrence of the defect symptom.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Execution Form */}
                  <div className="lg:col-span-7 bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                      <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        Effectiveness Logging & Audit Verification
                      </h4>
                      <span className="text-[11px] font-semibold text-teal-700">
                        Quality Monitoring Active
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">
                        Actual Status & Verification Results <span className="text-rose-500">*</span>:
                      </label>
                      <input
                        type="text"
                        disabled={complaint.status === 'CLOSED'}
                        value={capaData.actionStatus}
                        onChange={(e) => setCapaData((prev) => ({ ...prev, actionStatus: e.target.value }))}
                        placeholder="e.g., Audited 3 production batches MP-01, MP-02, MP-03: 100% passed zero defect criteria..."
                        className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">
                        30-Day Evidence Documentation (Reports, Audit Logs, URLs):
                      </label>
                      <textarea
                        rows={2}
                        disabled={complaint.status === 'CLOSED'}
                        value={capaData.evidenceDocumentation}
                        onChange={(e) => setCapaData((prev) => ({ ...prev, evidenceDocumentation: e.target.value }))}
                        placeholder="e.g., OQC Inspection Report #OQC-2026-088; 30-day reliability test report (Link: https://...); SOP retraining log..."
                        className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary disabled:opacity-60 disabled:cursor-not-allowed font-sans"
                      />
                      <p className="text-[10px] text-text-muted mt-1">
                        Record inspection report numbers or document URLs for permanent IATF 16949 compliance retention.
                      </p>
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
                          disabled={isUpdating}
                          onClick={() => {
                            const fullStatus = [
                              capaData.actionStatus || 'EFFECTIVENESS_VERIFYING',
                              capaData.evidenceDocumentation ? `[Evidence: ${capaData.evidenceDocumentation}]` : '',
                            ].filter(Boolean).join(' | ');
                            handleUpdatePhase(
                              {
                                actionStatus: fullStatus,
                                status: 'EFFECTIVENESS_VERIFYING',
                              },
                              'Effectiveness verification report saved successfully!'
                            );
                          }}
                          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border-subtle hover:bg-surface-canvas text-text-secondary text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
                        >
                          <Save className="w-4 h-4 text-text-muted" />
                          Save Verification Report
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => {
                            const fullStatus = [
                              capaData.actionStatus || 'VERIFIED_OK',
                              capaData.evidenceDocumentation ? `[Evidence: ${capaData.evidenceDocumentation.trim()}]` : '',
                            ].filter(Boolean).join(' | ');
                            handleUpdatePhase(
                              {
                                actionStatus: fullStatus,
                                status: 'EFFECTIVENESS_VERIFYING',
                              },
                              'Effectiveness confirmed! Phase 7 (Case Closure) activated.',
                              7
                            );
                          }}
                          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Confirm Effectiveness & Proceed to Phase 7 &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ============================================================ */}
              {/* PHASE 7: CLOSURE & SIGN-OFF (D8)                             */}
              {/* ============================================================ */}
              {activeWorkflowPhase === 7 && (
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

                    {/* Milestone Audit Trail */}
                    <div className="p-3.5 bg-surface-canvas rounded-xl text-xs space-y-2 border border-border-subtle">
                      <strong className="text-text-primary block text-[11px] uppercase tracking-wider">
                        Complaint Resolution Journey Summary:
                      </strong>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex justify-between py-0.5 border-b border-border-subtle">
                          <span className="text-text-muted">Received Date:</span>
                          <strong>{complaint.receivedDate}</strong>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-border-subtle">
                          <span className="text-text-muted">CFT Meetings:</span>
                          <strong className="text-emerald-700">{complaint.meetings?.length || 0} meeting(s) held</strong>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-border-subtle">
                          <span className="text-text-muted">Containment (D3):</span>
                          <strong className="text-emerald-700">{complaint.containmentAction ? 'Completed' : 'Pending'}</strong>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-border-subtle">
                          <span className="text-text-muted">Root Cause (D4):</span>
                          <strong className="text-emerald-700">{complaint.rootCause ? 'Identified' : 'Pending'}</strong>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-border-subtle">
                          <span className="text-text-muted">CAPA Plan (D5-D6):</span>
                          <strong className="text-emerald-700">{complaint.correctivePreventiveAction ? 'Committed' : 'Pending'}</strong>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-text-muted">30-Day Verification (D7):</span>
                          <strong className="text-emerald-700">{complaint.actionStatus || 'Standard Met'}</strong>
                        </div>
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

                        <div className="p-3 bg-surface-canvas rounded-xl border border-border-subtle text-xs">
                          <span className="text-[11px] text-text-muted block mb-1">Closure Remarks:</span>
                          <p className="text-text-primary whitespace-pre-wrap">
                            {complaint.remarks || closureData.remarks || 'No additional remarks.'}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowReopenModal(true)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-amber-300 hover:bg-amber-50 text-amber-800 text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4 text-amber-600" />
                            Request Ticket Reopen
                          </button>
                        </div>
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
              )}
            </div>
          </div>
        );
      })()}

      {/* Conclude Meeting Modal */}
      {concludeModalMeeting && (
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
                    Meeting Date: {concludeModalMeeting.meetingDate} ({concludeModalMeeting.startTime}) at {concludeModalMeeting.roomLocation}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConcludeModalMeeting(null)}
                className="p-1.5 rounded-lg hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConcludeSubmit} className="p-6 space-y-4 text-xs">
              {/* Conclusion with Quick Chips */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-text-secondary">
                  Meeting Conclusion <span className="text-rose-500">*</span>:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    'VALID Complaint - Urgent containment required within 48h',
                    'VALID Complaint - Require supplier 8D corrective action report',
                    'INFO REQUIRED - Request physical defect samples from customer',
                    'INVALID Complaint - Customer operational misuse, provide rebuttal',
                  ].map((chip) => (
                    <button
                      type="button"
                      key={chip}
                      onClick={() => setConcludeFormData((prev) => ({ ...prev, conclusion: chip }))}
                      className={`px-2.5 py-1 rounded-lg text-[11px] border transition-all cursor-pointer text-left ${
                        concludeFormData.conclusion === chip
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
                  value={concludeFormData.conclusion}
                  onChange={(e) => setConcludeFormData((prev) => ({ ...prev, conclusion: e.target.value }))}
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
                  value={concludeFormData.minutes}
                  onChange={(e) => setConcludeFormData((prev) => ({ ...prev, minutes: e.target.value }))}
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
                  value={concludeFormData.agreedContainment}
                  onChange={(e) => setConcludeFormData((prev) => ({ ...prev, agreedContainment: e.target.value }))}
                  placeholder="e.g., Quarantine 500 parts in Warehouse A; halt line #2 to verify reflow thermal profile..."
                  className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-xl text-text-primary focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-sans"
                />
              </div>

              {/* Checkbox auto sync */}
              <label className="flex items-center gap-2 p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={concludeFormData.transitionToContainment}
                  onChange={(e) => setConcludeFormData((prev) => ({ ...prev, transitionToContainment: e.target.checked }))}
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
                  onClick={() => setConcludeModalMeeting(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingConclude}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  {isSubmittingConclude ? (
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
      )}

      {/* Reopen Complaint Modal */}
      {showReopenModal && complaint && (
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
                onClick={() => setShowReopenModal(false)}
                className="p-1.5 rounded-lg hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReopenSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                <strong>Important Audit Notice:</strong> Reopening a closed case resets the closure date, returns the workflow to your selected stage for further CFT investigation, and records the reopening justification into the audit trail per IATF 16949 standards.
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-text-secondary">
                  Reopen and return case to which workflow phase? <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reopenTargetStatus}
                  onChange={(e) => setReopenTargetStatus(e.target.value)}
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
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="e.g., Customer reported defect recurrence in new batch; 30-day verification PPM exceeded allowable threshold..."
                  className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-xl text-text-primary text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setShowReopenModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingReopen || !reopenReason.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  {isSubmittingReopen ? (
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
      )}


      {/* Defect Image Lightbox Preview Modal */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-white text-xs">
              <span className="font-medium truncate max-w-md text-slate-300">
                Defect Photo Inspection
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                  title="Open original image in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImageUrl(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-2 flex items-center justify-center bg-black/40 overflow-auto">
              <img
                src={previewImageUrl}
                alt="Enlarged Defect Preview"
                className="max-h-[80vh] max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Picture URLs Modal */}
      {showEditPictureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-border-subtle w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-canvas/60">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-primary/10 text-primary">
                  <ImageIcon className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    Update Complaint Defect Images
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Case: #{complaint?.id} • {complaint?.trackingNo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditPictureModal(false)}
                className="p-1.5 rounded-lg hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-text-secondary">
                  Defect Picture URLs:
                </label>
                <textarea
                  rows={4}
                  value={editPictureUrls}
                  onChange={(e) => setEditPictureUrls(e.target.value)}
                  placeholder="Paste defect picture URLs (multiple URLs supported, separated by newlines or commas):&#10;https://example.com/defect1.jpg&#10;https://example.com/defect2.png"
                  className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-xl text-text-primary text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-[11px] text-text-muted">
                  Direct links from internal image servers, Google Drive, network NAS, or data URIs are supported.
                </p>
              </div>

              {/* Preview strip */}
              {parsePictureUrls(editPictureUrls).length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-text-secondary block">
                    Preview ({parsePictureUrls(editPictureUrls).length} valid picture(s)):
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {parsePictureUrls(editPictureUrls).map((url, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-border-subtle bg-surface-canvas relative"
                      >
                        <img
                          src={url}
                          alt={`Preview ${i + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="%2394a3b8" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setShowEditPictureModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isSavingPictures}
                  onClick={handleSavePictures}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  {isSavingPictures ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save Picture URLs
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
