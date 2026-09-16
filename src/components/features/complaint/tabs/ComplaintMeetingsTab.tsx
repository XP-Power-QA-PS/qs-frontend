import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, CheckCircle2, Clock, Edit3, FileSignature } from 'lucide-react';
import type { ComplaintDetail, ComplaintMeeting } from '@/types/complaint/complaint.types';

interface ComplaintMeetingsTabProps {
  complaint: ComplaintDetail;
  onOpenConcludeModal: (meeting: ComplaintMeeting) => void;
}

export const ComplaintMeetingsTab: React.FC<ComplaintMeetingsTabProps> = ({
  complaint,
  onOpenConcludeModal,
}) => {
  const navigate = useNavigate();

  return (
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
        </div>
      ) : (
        <div className="space-y-4">
          {complaint.meetings.map((m: ComplaintMeeting, index: number) => (
            <div
              key={m.id}
              className={`bg-white border rounded-2xl p-5 shadow-2xs space-y-4 transition-all ${m.isConcluded ? 'border-emerald-200 ring-1 ring-emerald-500/10' : 'border-border-subtle'
                }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border-subtle pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${m.isConcluded
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
                      onClick={() => onOpenConcludeModal(m)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-canvas hover:bg-surface-subtle text-text-secondary border border-border-subtle rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Minutes
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenConcludeModal(m)}
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
                    onClick={() => onOpenConcludeModal(m)}
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
  );
};
