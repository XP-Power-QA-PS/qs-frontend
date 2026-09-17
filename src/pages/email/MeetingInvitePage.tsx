import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, Link, Navigate } from 'react-router-dom';
import {
  CalendarDays,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Eye,
  Mail,
  X,
} from 'lucide-react';
import type { MeetingEmailRequest, EmailRecipient, EmailSendResult } from '@/types/email';
import { emailService } from '@/services/email';
import { complaintService } from '@/services/complaint/complaintService';
import type { ComplaintDetail, ComplaintSummary } from '@/types/complaint/complaint.types';
import { RecipientSelector } from '@/components/features/email/RecipientSelector';
import { EmailLivePreview } from '@/components/features/email/EmailLivePreview';
import { authService } from '@/services/auth';

// Get local date string YYYY-MM-DD
const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const MeetingInvitePage: React.FC = () => {
  const canAccess = authService.hasAnyRole(['ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_QC_ENGINEER']);
  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const complaintId = searchParams.get('complaintId');
  const stateComplaint = (location.state as { complaint?: ComplaintDetail | ComplaintSummary })?.complaint;

  const todayStr = getTodayDateString();

  const buildInitialForm = (comp?: ComplaintDetail | ComplaintSummary | null): MeetingEmailRequest => {
    if (comp) {
      return {
        trackingNo: comp.trackingNo || '',
        model: comp.model || '',
        customerName: comp.customerName || '',
        issueDescription: comp.issueDescription || '',
        meetingDate: todayStr,
        startTime: '',
        endTime: '',
        roomLocation: '',
        agenda: '',
        isCustomerInitiated: comp.internalExternal === 'EXTERNAL',
        recipients: [],
      };
    }
    return {
      trackingNo: '',
      model: '',
      customerName: '',
      issueDescription: '',
      meetingDate: todayStr,
      startTime: '',
      endTime: '',
      roomLocation: '',
      agenda: '',
      isCustomerInitiated: false,
      recipients: [],
    };
  };


  const [sourceComplaint, setSourceComplaint] = useState<ComplaintDetail | ComplaintSummary | null>(
    stateComplaint || null
  );
  const [formData, setFormData] = useState<MeetingEmailRequest>(() => buildInitialForm(stateComplaint));
  const [isLoadingComplaint, setIsLoadingComplaint] = useState<boolean>(!!complaintId && !stateComplaint);
  const [submitting, setSubmitting] = useState(false);
  const [sendResult, setSendResult] = useState<EmailSendResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (complaintId) {
      if (!sourceComplaint) {
        setIsLoadingComplaint(true);
      }
      complaintService
        .getComplaintById(complaintId)
        .then((comp) => {
          setSourceComplaint(comp);
          setFormData((prev) => ({
            ...prev,
            trackingNo: comp.trackingNo || prev.trackingNo,
            model: comp.model || prev.model,
            customerName: comp.customerName || prev.customerName,
            issueDescription: comp.issueDescription || prev.issueDescription,
            isCustomerInitiated: comp.internalExternal === 'EXTERNAL',
          }));
        })
        .catch((err) => {
          console.error('Failed to load source complaint', err);
          if (!sourceComplaint) {
            setErrorMessage(
              `Unable to load complaint details (ID: ${complaintId}): ${err.message || 'Network error'}`
            );
          }
        })
        .finally(() => {
          setIsLoadingComplaint(false);
        });
    }
  }, [complaintId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRecipientsChange = (newRecipients: EmailRecipient[]) => {
    setFormData((prev) => ({
      ...prev,
      recipients: newRecipients,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSendResult(null);

    if (!formData.meetingDate) {
      setErrorMessage('Please select a meeting date.');
      return;
    }
    if (formData.meetingDate < todayStr) {
      setErrorMessage('Meeting date cannot be in the past. Please select today or a future date.');
      return;
    }
    if (!formData.startTime) {
      setErrorMessage('Please specify the meeting start time.');
      return;
    }
    if (!formData.roomLocation?.trim()) {
      setErrorMessage('Please specify the room location or virtual meeting link.');
      return;
    }
    if (!formData.agenda?.trim()) {
      setErrorMessage('Please specify the meeting agenda & discussion topics.');
      return;
    }

    // Validate at least one TO recipient
    const hasTO = formData.recipients.some((r) => r.recipientType === 'TO');
    if (!hasTO) {
      setErrorMessage('Please select at least 1 primary recipient (TO) to dispatch meeting invitations.');
      return;
    }

    setSubmitting(true);

    try {
      let res: EmailSendResult;
      if (complaintId) {
        res = await complaintService.scheduleMeeting(complaintId, {
          meetingDate: formData.meetingDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          roomLocation: formData.roomLocation,
          agenda: formData.agenda,
          recipients: formData.recipients,
        });
      } else {
        res = await emailService.sendMeetingInvite(formData);
      }
      setSendResult(res);
      // Auto-scroll to top to see notification
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to send meeting invitations. Please check configuration or network connection.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">

      {/* Linked Source Complaint Banner */}
      {sourceComplaint && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-primary flex items-center gap-2">
                Inviting CFT Meeting for Case: {sourceComplaint.trackingNo}
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold">
                  SLA: 1 Business Day
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Model: <strong className="text-text-primary">{sourceComplaint.model}</strong> • Customer: <strong className="text-text-primary">{sourceComplaint.customerName}</strong> • Defect: <span className="text-rose-600 font-medium">{sourceComplaint.defectName || sourceComplaint.defectCategory}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-border-subtle rounded-xl text-xs font-semibold text-text-primary hover:bg-surface-subtle transition-colors shadow-2xs cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-primary" /> Preview Email
            </button>
            <Link
              to={`/complaints/${sourceComplaint.trackingNo || sourceComplaint.id}`}
              state={{ trackingNo: sourceComplaint.trackingNo }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-border-subtle rounded-xl text-xs font-semibold text-primary hover:bg-surface-subtle transition-colors shrink-0 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Case
            </Link>
          </div>
        </div>
      )}

      {/* Loading state banner */}
      {isLoadingComplaint && (
        <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/20 text-primary shadow-2xs flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin shrink-0" />
          <p className="text-xs font-semibold">Loading complaint case data #{complaintId}...</p>
        </div>
      )}

      {/* Success Notification Banner */}
      {sendResult && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-2xs flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Meeting Invitations Dispatched Successfully!</h4>
            <p className="text-xs text-emerald-800 leading-relaxed">{sendResult.message}</p>
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold pt-1">
              <span className="px-2.5 py-0.5 bg-emerald-100 rounded-md text-emerald-800">
                Total: {sendResult.totalRecipients} recipients
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-100 rounded-md text-emerald-800">
                {sendResult.toCount} TO
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-100 rounded-md text-emerald-800">
                {sendResult.ccCount} CC
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-100 rounded-md text-emerald-800">
                Case: #{sendResult.trackingNo}
              </span>
            </div>
            {sourceComplaint && (
              <div className="pt-2">
                <Link
                  to={`/complaints/${sourceComplaint.trackingNo || sourceComplaint.id}?tab=meetings`}
                  state={{ trackingNo: sourceComplaint.trackingNo }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to CFT Meetings for Case #{sourceComplaint.trackingNo}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorMessage && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-2xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Email Dispatch Error</h4>
            <p className="text-xs text-rose-800 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Form: Side-by-side Parallel Cards */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start">
          {/* Card 1: Mandatory Meeting Details */}
          <div className="bg-white border border-border-subtle rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Mandatory Meeting Details (4 Core Criteria)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  📅 Meeting Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="meetingDate"
                  min={todayStr}
                  value={formData.meetingDate}
                  onChange={handleInputChange}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  required
                  className="w-full px-3 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary cursor-pointer hover:border-primary/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  📍 Room Location / Virtual Link <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="roomLocation"
                  value={formData.roomLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., Meeting Room A201 or Teams link..."
                  required
                  className="w-full px-3 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  ⏰ Start Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  required
                  className="w-full px-3 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary cursor-pointer hover:border-primary/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  ⏰ End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime || ''}
                  onChange={handleInputChange}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className="w-full px-3 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary cursor-pointer hover:border-primary/60 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                📝 Meeting Agenda & Discussion Topics <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="agenda"
                rows={5}
                value={formData.agenda}
                onChange={handleInputChange}
                required
                placeholder="Enter meeting agenda and technical review topics..."
                className="w-full px-3 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary leading-relaxed"
              />
            </div>
          </div>

          {/* Card 2: Recipient Selection */}
          <div className="bg-white border border-border-subtle rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Select Meeting Invitees (Recipients)
              </h3>
              <span className="text-xs text-text-muted">
                Internal directory & external emails supported
              </span>
            </div>

            <RecipientSelector
              recipients={formData.recipients}
              onChange={handleRecipientsChange}
            />
          </div>
        </div>

        {/* Action Toolbar: Preview Button + Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border-subtle hover:bg-surface-subtle text-text-primary text-xs font-bold rounded-xl shadow-2xs transition-all active:scale-98 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-primary" />
            <span>Preview Email Invitation</span>
          </button>

          <button
            type="submit"
            disabled={submitting || formData.recipients.length === 0}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 active:bg-primary text-white text-xs font-bold rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing & Dispatching Invites...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Dispatch Meeting Invitations ({formData.recipients.length} Recipients)</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Live Email Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-border-subtle rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-border-subtle flex items-center justify-between bg-surface-canvas">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-text-primary">
                  Live Email Preview: Meeting Invitation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface-subtle">
              <EmailLivePreview request={formData} />
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-border-subtle bg-surface-canvas flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 bg-surface-subtle hover:bg-surface-muted text-text-primary text-xs font-semibold rounded-lg border border-border-subtle transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
