import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import {
  CalendarDays,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Info,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import type { MeetingEmailRequest, EmailRecipient, EmailSendResult } from '@/types/email';
import { emailService } from '@/services/email';
import { complaintService } from '@/services/complaint/complaintService';
import type { ComplaintDetail, ComplaintSummary } from '@/types/complaint/complaint.types';
import { QuickSmtpTestCard } from '@/components/features/email/QuickSmtpTestCard';
import { RecipientSelector } from '@/components/features/email/RecipientSelector';
import { EmailLivePreview } from '@/components/features/email/EmailLivePreview';

const generateComplaintAgenda = (comp: ComplaintDetail | ComplaintSummary): string => {
  return `1. Review customer complaint: ${comp.customerName || 'N/A'} - Model: ${comp.model || 'N/A'}
2. Defect symptom analysis: ${comp.defectName || comp.defectCategory || 'Defect'} (Affected quantity: ${comp.quantity || 1} EA)
3. Discuss & commit Interim Containment Action (SLA: 2 Business Days)
4. Assign CFT Root Cause 5-Why Investigation Owner (SLA: 5 Business Days)`;
};

export const MeetingInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const complaintId = searchParams.get('complaintId');
  const stateComplaint = (location.state as { complaint?: ComplaintDetail | ComplaintSummary })?.complaint;

  // Tomorrow's date formatted as YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const buildInitialForm = (comp?: ComplaintDetail | ComplaintSummary | null): MeetingEmailRequest => {
    if (comp) {
      return {
        trackingNo: comp.trackingNo || '',
        model: comp.model || '',
        customerName: comp.customerName || '',
        issueDescription: comp.issueDescription || '',
        meetingDate: defaultDate,
        startTime: '09:30',
        endTime: '10:30',
        roomLocation: 'Technical Meeting Room A201 / Microsoft Teams',
        agenda: generateComplaintAgenda(comp),
        isCustomerInitiated: comp.internalExternal === 'EXTERNAL',
        recipients: [],
      };
    }
    return {
      trackingNo: '',
      model: '',
      customerName: '',
      issueDescription: '',
      meetingDate: defaultDate,
      startTime: '09:30',
      endTime: '10:30',
      roomLocation: 'Technical Meeting Room A201 / Microsoft Teams',
      agenda: `1. Review customer quality complaint information and symptom feedback.
2. Preliminary Review: Determine complaint validity (Valid / Invalid / Info Needed).
3. Align and commit immediate Containment Action within 48h SLA.`,
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
            agenda:
              !prev.agenda ||
              prev.agenda.startsWith('1. Rà soát') ||
              prev.agenda.startsWith('1. Review')
                ? generateComplaintAgenda(comp)
                : prev.agenda,
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

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all fields to default?')) {
      setFormData(buildInitialForm(sourceComplaint));
      setSendResult(null);
      setErrorMessage(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <CalendarDays className="w-4 h-4" /> Step 2: Preliminary Review
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Convene CFT Review Meeting & Dispatch Invites
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Convene Cross-Functional Team (CFT) for preliminary complaint evaluation per IATF 16949 / ISO 9001.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-text-secondary bg-white border border-border-subtle rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Template
        </button>
      </div>

      {/* Linked Source Complaint Banner */}
      {sourceComplaint && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-primary flex items-center gap-2">
                Inviting CFT Meeting for Case: {sourceComplaint.trackingNo}
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                  SLA: 1 Business Day
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Model: <strong className="text-text-primary">{sourceComplaint.model}</strong> • Customer: <strong className="text-text-primary">{sourceComplaint.customerName}</strong> • Defect: <span className="text-rose-600 font-medium">{sourceComplaint.defectName || sourceComplaint.defectCategory}</span>
              </p>
            </div>
          </div>
          <Link
            to={`/complaints/${sourceComplaint.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border-subtle rounded-lg text-xs font-semibold text-primary hover:bg-surface-subtle transition-colors shrink-0 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Case
          </Link>
        </div>
      )}

      {/* Loading state banner */}
      {isLoadingComplaint && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-primary shadow-xs flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin shrink-0" />
          <p className="text-xs font-semibold">Loading complaint case data #{complaintId}...</p>
        </div>
      )}

      {/* Quick SMTP Test Widget */}
      <QuickSmtpTestCard />

      {/* Success Notification Banner */}
      {sendResult && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-xs flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Meeting Invitations Dispatched Successfully!</h4>
            <p className="text-xs text-emerald-800 leading-relaxed">{sendResult.message}</p>
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold pt-1">
              <span className="px-2 py-0.5 bg-emerald-100 rounded text-emerald-800">
                Total: {sendResult.totalRecipients} recipients
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 rounded text-emerald-800">
                {sendResult.toCount} TO
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 rounded text-emerald-800">
                {sendResult.ccCount} CC
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 rounded text-emerald-800">
                Case: #{sendResult.trackingNo}
              </span>
            </div>
            {sourceComplaint && (
              <div className="pt-2">
                <Link
                  to={`/complaints/${sourceComplaint.id}?tab=meetings`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
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
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 shadow-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Email Dispatch Error</h4>
            <p className="text-xs text-rose-800 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Split-screen Layout: Form on Left (7 cols), Live Preview on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Card 1: 4 Core Meeting Fields */}
          <div className="bg-white border border-border-subtle rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs">
                  1
                </span>
                Mandatory Meeting Details (4 Core Criteria)
              </h3>
              <span className="text-[11px] font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20">
                SLA: 1 Business Day
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  📅 Meeting Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="meetingDate"
                  value={formData.meetingDate}
                  onChange={handleInputChange}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  required
                  className="w-full px-3 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary cursor-pointer hover:border-primary/60 transition-colors"
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
                  className="w-full px-3 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary"
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
                  className="w-full px-3 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary cursor-pointer hover:border-primary/60 transition-colors"
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
                  className="w-full px-3 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary cursor-pointer hover:border-primary/60 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                📝 Meeting Agenda & Discussion Topics <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="agenda"
                rows={4}
                value={formData.agenda}
                onChange={handleInputChange}
                required
                placeholder="Enter meeting agenda and technical review topics..."
                className="w-full px-3 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary leading-relaxed"
              />
            </div>
          </div>

          {/* Card 2: Recipient Selection */}
          <div className="bg-white border border-border-subtle rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs">
                  2
                </span>
                Select Meeting Invitees (Recipients)
              </h3>
              <span className="text-xs text-text-muted">
                Internal directory selection & external emails supported
              </span>
            </div>

            <RecipientSelector
              recipients={formData.recipients}
              onChange={handleRecipientsChange}
            />
          </div>

          {/* Card 3: Complaint Details (Auto-populated or customized) */}
          <div className="bg-white border border-border-subtle rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs">
                  3
                </span>
                Complaint Summary (Embedded in Email)
              </h3>
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Populated from Intake
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Tracking No
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="trackingNo"
                    value={formData.trackingNo}
                    onChange={handleInputChange}
                    readOnly={!!sourceComplaint}
                    className={`w-full px-3 py-2 text-sm border rounded-lg font-mono font-semibold ${
                      sourceComplaint
                        ? 'bg-surface-subtle border-border-subtle text-text-secondary cursor-not-allowed pr-8'
                        : 'bg-surface-canvas border-border-subtle text-text-primary'
                    }`}
                  />
                  {sourceComplaint && (
                    <span
                      className="absolute right-2.5 top-2.5 text-text-muted"
                      title="Tracking number auto-linked from complaint case"
                    >
                      <Lock className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Customer
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-lg text-text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Model
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-lg text-text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Defect Symptom & Issue Description
              </label>
              <input
                type="text"
                name="issueDescription"
                value={formData.issueDescription || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-lg text-text-primary"
              />
            </div>
          </div>

          {/* Action Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || formData.recipients.length === 0}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 active:bg-primary text-white text-sm font-bold rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing & Dispatching Invites...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Dispatch Meeting Invitations ({formData.recipients.length} Recipients)</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Live Email Preview (Sticky on desktop) */}
        <div className="lg:col-span-5 lg:sticky lg:top-6">
          <EmailLivePreview request={formData} />
        </div>
      </div>
    </div>
  );
};
