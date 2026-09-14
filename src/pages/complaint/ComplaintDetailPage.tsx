import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Calendar, Sparkles, Check } from 'lucide-react';
import { complaintService } from '@/services/complaint/complaintService';
import type { ComplaintDetail, ComplaintUpdateRequest, ComplaintMeeting } from '@/types/complaint/complaint.types';

// Modular Feature Components
import { ComplaintHeader } from '@/components/features/complaint/ComplaintHeader';
import { WorkflowStepper } from '@/components/features/complaint/workflow/WorkflowStepper';
import { ComplaintInfoTab } from '@/components/features/complaint/tabs/ComplaintInfoTab';
import { ComplaintMeetingsTab } from '@/components/features/complaint/tabs/ComplaintMeetingsTab';
import { Phase2Assignment } from '@/components/features/complaint/workflow/Phase2Assignment';
import { Phase3Containment } from '@/components/features/complaint/workflow/Phase3Containment';
import { Phase4RootCause } from '@/components/features/complaint/workflow/Phase4RootCause';
import { Phase5CapaPlan } from '@/components/features/complaint/workflow/Phase5CapaPlan';
import { Phase6Effectiveness } from '@/components/features/complaint/workflow/Phase6Effectiveness';
import { Phase7Closure } from '@/components/features/complaint/workflow/Phase7Closure';
import { ConcludeMeetingModal } from '@/components/features/complaint/modals/ConcludeMeetingModal';
import { ReopenTicketModal } from '@/components/features/complaint/modals/ReopenTicketModal';
import { ImageLightboxModal } from '@/components/features/complaint/modals/ImageLightboxModal';
import { EditDefectPicturesModal } from '@/components/features/complaint/modals/EditDefectPicturesModal';

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

  // Phase 2: Assignment Data
  const [assignmentData, setAssignmentData] = useState({
    assignedTeam: '',
    assignedPerson: '',
    priority: 'MEDIUM',
    assignmentDeadline: '',
  });

  // Phase 3: Containment Data (3-Way Checklist & Clean Point)
  const [containmentData, setContainmentData] = useState({
    containmentAction: '',
    containmentDueDate: '',
    containmentOwner: '',
    containmentCompletionDate: '',
    containmentStatus: 'IN_PROGRESS',
    inHouseQty: '',
    inHouseRedTagged: true,
    customerQty: '',
    customerNotified: false,
    cleanPoint: '',
  });

  // Phase 4: Root Cause Data (5-Why Occurrence & Escape)
  const [rootCauseData, setRootCauseData] = useState({
    rootCause: '',
    rootCauseCategory: 'Method',
    rootCauseOwner: '',
    rootCauseCompletionDate: '',
    occurrenceCause: '',
    escapeCause: '',
  });

  // Phase 5: CAPA Data
  const [capaData, setCapaData] = useState({
    correctivePreventiveAction: '',
    correctiveAction: '',
    preventiveAction: '',
    actionOwner: '',
    actionDueDate: '',
    actionStatus: 'OPEN',
    capaCompletionDate: '',
    evidenceDocumentation: '',
  });

  // Phase 6: Effectiveness Data
  const [effectivenessData, setEffectivenessData] = useState<{
    effectivenessStatus: 'PENDING' | 'EFFECTIVE' | 'NOT_EFFECTIVE';
    effectivenessVerifiedDate: string;
    effectivenessVerifiedBy: string;
    effectivenessRemarks: string;
  }>({
    effectivenessStatus: 'PENDING',
    effectivenessVerifiedDate: '',
    effectivenessVerifiedBy: '',
    effectivenessRemarks: '',
  });

  // Phase 7: Closure Data
  const [closureData, setClosureData] = useState({
    closureDate: new Date().toISOString().slice(0, 10),
    finalStatus: 'ACCEPTED',
    finalEvidence: '',
    remarks: '',
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
      setAssignmentData({
        assignedTeam: complaint.assignedTeam || '',
        assignedPerson: complaint.assignedPerson || '',
        priority: complaint.priority || 'MEDIUM',
        assignmentDeadline: complaint.assignmentDeadline || '',
      });

      setContainmentData((prev) => ({
        ...prev,
        containmentAction: complaint.containmentAction || '',
        containmentDueDate: complaint.containmentDueDate || '',
        containmentOwner: complaint.containmentOwner || '',
        containmentCompletionDate: complaint.containmentCompletionDate || '',
        containmentStatus: complaint.containmentStatus || 'IN_PROGRESS',
        inHouseQty: prev.inHouseQty || (complaint.quantity ? String(complaint.quantity) : ''),
      }));

      setRootCauseData((prev) => ({
        ...prev,
        rootCause: complaint.rootCause || '',
        rootCauseCategory: complaint.rootCauseCategory || 'Method',
        rootCauseOwner: complaint.rootCauseOwner || '',
        rootCauseCompletionDate: complaint.rootCauseCompletionDate || '',
      }));

      // Parse corrective and preventive actions if structured
      let cAction = complaint.correctiveAction || '';
      let pAction = complaint.preventiveAction || '';
      if (!cAction && !pAction && complaint.correctivePreventiveAction) {
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

      // Parse action status and evidence documentation if structured
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
        capaCompletionDate: complaint.capaCompletionDate || '',
        evidenceDocumentation: parsedEvidence,
      });

      setEffectivenessData({
        effectivenessStatus: (complaint.effectivenessStatus as any) || 'PENDING',
        effectivenessVerifiedDate: complaint.effectivenessVerifiedDate || '',
        effectivenessVerifiedBy: complaint.effectivenessVerifiedBy || '',
        effectivenessRemarks: complaint.effectivenessRemarks || '',
      });

      setEditPictureUrls(complaint.pictureUrls || '');

      setClosureData({
        closureDate: complaint.closureDate || new Date().toISOString().slice(0, 10),
        finalStatus: complaint.finalStatus || 'ACCEPTED',
        finalEvidence: complaint.finalEvidence || '',
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
      alert('Please enter reason for reopening the case.');
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


  const isPhase6Verified =
    complaint.status === 'CLOSED' ||
    (complaint.status === 'EFFECTIVENESS_VERIFYING' &&
      (complaint.actionStatus?.includes('VERIFIED') ||
        complaint.actionStatus?.includes('[Minh chứng:') ||
        complaint.actionStatus?.includes('[Evidence:') ||
        activeWorkflowPhase === 7));

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

  const workflowPhases: Array<{
    num: 2 | 3 | 4 | 5 | 6 | 7;
    title: string;
    sla: string;
  }> = [
    { num: 2, title: 'CFT Review', sla: '1d' },
    { num: 3, title: '3-Way Containment', sla: '2d (48h)' },
    { num: 4, title: '5-Why Root Cause', sla: '5d' },
    { num: 5, title: 'CAPA Plan', sla: '10d' },
    { num: 6, title: '30-Day Verification', sla: '30d' },
    { num: 7, title: '8D Case Closure', sla: 'Finish' },
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
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* 1. Header with Breadcrumbs, Badges, SLA Banners, and Action Buttons */}
      <ComplaintHeader
        complaint={complaint}
        activeWorkflowPhase={activeWorkflowPhase}
        isPhase6Verified={isPhase6Verified}
        onBack={() => navigate('/complaints')}
        onNavigateToWorkflow={() => {
          setActiveTab('action');
          setActiveWorkflowPhase(getInitialActivePhase(complaint.status));
        }}
        onNavigateToMeetings={() => navigate(`/meeting-invite?complaintId=${complaint.id}`, { state: { complaint } })}
        onReopenRequest={() => setShowReopenModal(true)}
      />

      {/* Success / Error Message Banners for Actions */}
      {updateSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-xs flex items-center gap-3 animate-in fade-in duration-200">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold">{updateSuccessMsg}</p>
        </div>
      )}

      {updateErrorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 shadow-xs flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs font-semibold">{updateErrorMsg}</p>
        </div>
      )}

      {/* 2. Process Stepper (Jeanette Quality SLA Process Flow) */}
      <WorkflowStepper
        complaint={complaint}
        activeTab={activeTab}
        activeWorkflowPhase={activeWorkflowPhase}
        effectiveStepIndex={effectiveStepIndex}
        onSelectStep={(stepNum: number) => {
          if (stepNum === 1) {
            setActiveTab('info');
          } else if (stepNum === 2) {
            setActiveTab('meetings');
          } else {
            setActiveTab('action');
            setActiveWorkflowPhase(stepNum as 2 | 3 | 4 | 5 | 6 | 7);
          }
        }}
      />

      {/* 3. Main Tabs Navigation */}
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
        <ComplaintInfoTab
          complaint={complaint}
          parsePictureUrls={parsePictureUrls}
          onOpenEditPictures={() => setShowEditPictureModal(true)}
          onPreviewImage={setPreviewImageUrl}
          onNavigateToActions={() => {
            setActiveTab('action');
            setActiveWorkflowPhase(getInitialActivePhase(complaint.status));
          }}
        />
      )}

      {/* Tab 2: CFT Meetings Management & Minutes */}
      {activeTab === 'meetings' && (
        <ComplaintMeetingsTab
          complaint={complaint}
          onOpenConcludeModal={openConcludeModal}
        />
      )}

      {/* Tab 3: Stage-Gate Incident Workflow (IATF 16949 / 8D / Jeanette SLA) */}
      {activeTab === 'action' && (
        <div className="space-y-6">
          {/* Fast Phase Switcher Header */}
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

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {activeWorkflowPhase === 2 && (
              <Phase2Assignment
                complaint={complaint}
                assignmentData={assignmentData}
                setAssignmentData={setAssignmentData}
                isUpdating={isUpdating}
                handleUpdatePhase={handleUpdatePhase}
                setActiveTab={setActiveTab}
                setActiveWorkflowPhase={setActiveWorkflowPhase}
                latestConcludedMeeting={latestConcludedMeeting}
              />
            )}

            {activeWorkflowPhase === 3 && (
              <Phase3Containment
                complaint={complaint}
                containmentData={containmentData}
                setContainmentData={setContainmentData}
                isUpdating={isUpdating}
                handleUpdatePhase={handleUpdatePhase}
                setShowReopenModal={setShowReopenModal}
                latestConcludedMeeting={latestConcludedMeeting}
              />
            )}

            {activeWorkflowPhase === 4 && (
              <Phase4RootCause
                complaint={complaint}
                rootCauseData={rootCauseData}
                setRootCauseData={setRootCauseData}
                isUpdating={isUpdating}
                handleUpdatePhase={handleUpdatePhase}
                setShowReopenModal={setShowReopenModal}
              />
            )}

            {activeWorkflowPhase === 5 && (
              <Phase5CapaPlan
                complaint={complaint}
                capaData={capaData}
                setCapaData={setCapaData}
                isUpdating={isUpdating}
                handleUpdatePhase={handleUpdatePhase}
                setShowReopenModal={setShowReopenModal}
              />
            )}

            {activeWorkflowPhase === 6 && (
              <Phase6Effectiveness
                complaint={complaint}
                effectivenessData={effectivenessData}
                setEffectivenessData={setEffectivenessData}
                capaData={capaData}
                setCapaData={setCapaData}
                isUpdating={isUpdating}
                handleUpdatePhase={handleUpdatePhase}
                setShowReopenModal={setShowReopenModal}
                setReopenTargetStatus={setReopenTargetStatus}
              />
            )}

            {activeWorkflowPhase === 7 && (
              <Phase7Closure
                complaint={complaint}
                closureData={closureData}
                setClosureData={setClosureData}
                isUpdating={isUpdating}
                handleUpdatePhase={handleUpdatePhase}
                setShowReopenModal={setShowReopenModal}
              />
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <ConcludeMeetingModal
        meeting={concludeModalMeeting}
        formData={concludeFormData}
        isSubmitting={isSubmittingConclude}
        onClose={() => setConcludeModalMeeting(null)}
        onChange={setConcludeFormData}
        onSubmit={handleConcludeSubmit}
      />

      <ReopenTicketModal
        isOpen={showReopenModal}
        complaint={complaint}
        reopenTargetStatus={reopenTargetStatus}
        reopenReason={reopenReason}
        isSubmitting={isSubmittingReopen}
        onClose={() => setShowReopenModal(false)}
        onTargetStatusChange={setReopenTargetStatus}
        onReasonChange={setReopenReason}
        onSubmit={handleReopenSubmit}
      />

      <ImageLightboxModal
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />

      <EditDefectPicturesModal
        isOpen={showEditPictureModal}
        complaint={complaint}
        pictureUrls={editPictureUrls}
        isSaving={isSavingPictures}
        onClose={() => setShowEditPictureModal(false)}
        onUrlsChange={setEditPictureUrls}
        onSave={handleSavePictures}
        parsePictureUrls={parsePictureUrls}
      />
    </div>
  );
};
