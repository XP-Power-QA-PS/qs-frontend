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
      case 'RECEIVED':
        return 2;
      case 'MEETING_SCHEDULED':
      case 'CONTAINMENT_COMMITTED':
        return 3;
      case 'ROOT_CAUSE_ANALYZED':
        return 4;
      case 'CAPA_COMMITTED':
        return 5;
      case 'EFFECTIVENESS_VERIFYING':
        return 6;
      case 'CLOSED':
        return 7;
      default:
        return 3;
    }
  };

  // Stage-Gate Workflow active view phase: 2 | 3 | 4 | 5 | 6 | 7
  const [activeWorkflowPhase, setActiveWorkflowPhase] = useState<2 | 3 | 4 | 5 | 6 | 7>(3);
  const [isInitialPhaseSet, setIsInitialPhaseSet] = useState<boolean>(false);

  // Modals state
  const [concludeModalMeeting, setConcludeModalMeeting] = useState<ComplaintMeeting | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showEditPictureModal, setShowEditPictureModal] = useState<boolean>(false);
  const [showReopenModal, setShowReopenModal] = useState<boolean>(false);

  // In-place phase update states
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string | null>(null);
  const [updateErrorMsg, setUpdateErrorMsg] = useState<string | null>(null);

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
    if (complaint && !isInitialPhaseSet) {
      setActiveWorkflowPhase(getInitialActivePhase(complaint.status));
      setIsInitialPhaseSet(true);
    }
  }, [complaint, isInitialPhaseSet]);

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
          onOpenConcludeModal={(meeting) => setConcludeModalMeeting(meeting)}
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
                isUpdating={isUpdating}
                handleUpdatePhase={handleUpdatePhase}
                latestConcludedMeeting={latestConcludedMeeting}
                onReopenCase={() => setShowReopenModal(true)}
              />
            )}

            {activeWorkflowPhase === 4 && (
              <Phase4RootCause
                complaint={complaint}
                isUpdating={isUpdating}
                handleUpdatePhase={handleUpdatePhase}
                onReopenCase={() => setShowReopenModal(true)}
              />
            )}

            {activeWorkflowPhase === 5 && (
              <Phase5CapaPlan
                complaint={complaint}
                isUpdating={isUpdating}
                handleUpdatePhase={handleUpdatePhase}
                onReopenCase={() => setShowReopenModal(true)}
              />
            )}

            {activeWorkflowPhase === 6 && (
              <Phase6Effectiveness
                complaint={complaint}
                isUpdating={isUpdating}
                handleUpdatePhase={handleUpdatePhase}
                onReopenCase={() => setShowReopenModal(true)}
              />
            )}

            {activeWorkflowPhase === 7 && (
              <Phase7Closure
                complaint={complaint}
                isUpdating={isUpdating}
                handleUpdatePhase={handleUpdatePhase}
                onReopenCase={() => setShowReopenModal(true)}
              />
            )}
          </div>
        </div>
      )}

      {/* Modals - Deep Modules with Encapsulated State */}
      <ConcludeMeetingModal
        complaintId={complaint.id}
        meeting={concludeModalMeeting}
        initialContainmentAction={complaint.containmentAction}
        onClose={() => setConcludeModalMeeting(null)}
        onSuccess={(updated) => {
          setComplaint(updated);
          setUpdateSuccessMsg('Meeting concluded and minutes logged successfully!');
          setTimeout(() => setUpdateSuccessMsg(null), 5000);
        }}
      />

      <ReopenTicketModal
        isOpen={showReopenModal}
        complaint={complaint}
        onClose={() => setShowReopenModal(false)}
        onSuccess={(updated, newPhase) => {
          setComplaint(updated);
          setShowReopenModal(false);
          setUpdateSuccessMsg('Complaint case successfully reopened! Status reset to active investigation.');
          setTimeout(() => setUpdateSuccessMsg(null), 5000);
          setActiveWorkflowPhase(newPhase);
        }}
      />

      <ImageLightboxModal
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />

      <EditDefectPicturesModal
        isOpen={showEditPictureModal}
        complaint={complaint}
        onClose={() => setShowEditPictureModal(false)}
        onSuccess={(updated) => {
          setComplaint(updated);
          setUpdateSuccessMsg('Defect picture URLs updated successfully!');
          setTimeout(() => setUpdateSuccessMsg(null), 4000);
        }}
      />
    </div>
  );
};
