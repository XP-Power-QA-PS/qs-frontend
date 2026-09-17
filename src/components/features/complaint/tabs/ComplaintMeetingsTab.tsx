import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Users, MapPin, User, MailCheck, Clock, FileText } from 'lucide-react';
import type { ComplaintDetail, ComplaintMeeting } from '@/types/complaint/complaint.types';

interface ComplaintMeetingsTabProps {
  complaint: ComplaintDetail;
}

interface ParsedRecipient {
  email: string;
  name?: string;
  department?: string;
  recipientType?: string;
}

const parseRecipients = (jsonStr?: string): ParsedRecipient[] => {
  if (!jsonStr) return [];
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const ComplaintMeetingsTab: React.FC<ComplaintMeetingsTabProps> = ({ complaint }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-border-subtle p-5 rounded-2xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary font-bold">
              <Calendar className="w-5 h-5" />
            </span>
            <h3 className="text-sm font-bold text-text-primary">
              Cross-Functional Team (CFT) Meetings
            </h3>
          </div>
          <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
            Schedule CFT review meetings with Engineering, Production, and QA upon complaint intake. Email invitations and calendar invites (.ics) are dispatched automatically to all attendees.
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
      {!complaint.meetings || complaint.meetings.length === 0 ? (
        <div className="bg-white border border-border-subtle rounded-2xl p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-text-primary">No CFT meetings scheduled yet</h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            This complaint has no preliminary CFT review scheduled yet. Click below to dispatch email invitations and calendar .ics files to the team.
          </p>
          <button
            onClick={() => navigate(`/meeting-invite?complaintId=${complaint.id}`, { state: { complaint } })}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-container transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule Meeting Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {complaint.meetings.map((m: ComplaintMeeting, index: number) => {
            const recipients = parseRecipients(m.recipientsJson);

            return (
              <div
                key={m.id}
                className="bg-white border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4 transition-all hover:border-border-strong"
              >
                {/* Meeting Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs bg-primary/10 text-primary">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-bold text-text-primary">
                          CFT Review Meeting: {m.meetingDate}
                        </h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <MailCheck className="w-3 h-3 text-emerald-600" />
                          Invite Dispatched
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-muted mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-text-muted" />
                          {m.startTime} {m.endTime ? `- ${m.endTime}` : ''}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-text-muted" />
                          Location: <strong className="text-text-secondary">{m.roomLocation}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3 h-3 text-text-muted" />
                          Organizer: <strong className="text-text-secondary">{m.organizerEmail}</strong>
                        </span>
                        {m.sentAt && (
                          <span className="text-[10px] text-text-muted">
                            (Sent: {new Date(m.sentAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invited Attendees */}
                {recipients.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary mb-2">
                      <Users className="w-3.5 h-3.5 text-text-muted" />
                      <span>Invited CFT Members ({recipients.length}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recipients.map((r, rIdx) => (
                        <span
                          key={rIdx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] bg-surface-canvas border border-border-subtle text-text-primary"
                          title={r.email}
                        >
                          <span className="font-medium">{r.name || r.email}</span>
                          {r.department && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-primary/10 text-primary font-bold">
                              {r.department}
                            </span>
                          )}
                          {r.recipientType && (
                            <span className="text-[9px] text-text-muted font-mono">
                              ({r.recipientType})
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agenda */}
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-text-muted" />
                    <span>Meeting Agenda & Discussion Topics:</span>
                  </div>
                  <p className="text-xs text-text-primary bg-surface-canvas p-3 rounded-xl whitespace-pre-wrap border border-border-subtle leading-relaxed font-sans">
                    {m.agenda}
                  </p>
                </div>

                {/* Historical Notes (Read-only if legacy data exists) */}
                {(m.conclusion || m.minutes || m.agreedContainment) && (
                  <div className="bg-surface-subtle border border-border-subtle rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="text-[11px] font-bold text-text-secondary">
                      Historical Meeting Records / Notes:
                    </div>
                    {m.conclusion && (
                      <div>
                        <span className="text-text-muted font-semibold text-[11px]">Conclusion: </span>
                        <span className="text-text-primary">{m.conclusion}</span>
                      </div>
                    )}
                    {m.minutes && (
                      <div>
                        <span className="text-text-muted font-semibold text-[11px]">Minutes: </span>
                        <p className="text-text-secondary whitespace-pre-wrap bg-white p-2 rounded-lg border border-border-subtle mt-1 text-[11px]">
                          {m.minutes}
                        </p>
                      </div>
                    )}
                    {m.agreedContainment && (
                      <div>
                        <span className="text-text-muted font-semibold text-[11px]">Agreed Containment: </span>
                        <span className="text-text-primary">{m.agreedContainment}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
