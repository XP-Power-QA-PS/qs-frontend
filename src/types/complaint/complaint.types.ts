import type { EmailRecipient } from '../email/email.types';

export type ComplaintStatus =
  | 'RECEIVED'
  | 'MEETING_SCHEDULED'
  | 'CONTAINMENT_COMMITTED'
  | 'ROOT_CAUSE_ANALYZED'
  | 'CAPA_COMMITTED'
  | 'EFFECTIVENESS_VERIFYING'
  | 'CLOSED';

export type InternalExternal = 'INTERNAL' | 'EXTERNAL';


export type EffectivenessStatus = 'PENDING' | 'EFFECTIVE' | 'NOT_EFFECTIVE';

export interface ComplaintCreateRequest {
  receivedDate: string; // YYYY-MM-DD
  controlNo?: string;
  buildingStage?: string;
  capaNo?: string;
  originOfComplaint?: string;
  internalExternal?: InternalExternal;
  salesforceCapa?: string;
  area?: string;
  customerName: string;
  customerFinding?: string;
  model: string;
  issueDescription: string;
  defectCategory?: string;
  defectName?: string;
  quantity?: number;
  serialNumbers?: string;
  pictureUrls?: string;
  pictureTmpKeys?: string[];

  // Phase 2: Initial Assignment (optional on intake)
  assignedTeam?: string;
  assignedPerson?: string;
  assignmentDeadline?: string;
}

export interface ComplaintMeeting {
  id: string | number;
  trackingNo: string;
  meetingDate: string;
  startTime: string;
  endTime?: string;
  roomLocation: string;
  agenda: string;
  organizerEmail: string;
  organizerName?: string;
  recipientsJson: string;
  sentAt: string;
  minutes?: string;
  conclusion?: string;
  agreedContainment?: string;
  isConcluded?: boolean;
  concludedAt?: string;
  concludedBy?: string;
}

export interface MeetingConcludeRequest {
  conclusion: string;
  minutes?: string;
  agreedContainment?: string;
  transitionToContainment?: boolean;
}

export interface ComplaintSummary {
  id: string | number;
  trackingNo: string;
  controlNo?: string;
  capaNo?: string;
  year: number;
  month: string;
  week?: number;
  receivedDate: string;
  dueDate?: string;
  customerName: string;
  model: string;
  issueDescription: string;
  defectCategory?: string;
  defectName?: string;
  quantity?: number;
  internalExternal: InternalExternal;

  // Assignment
  assignedTeam?: string;
  assignedPerson?: string;

  status: ComplaintStatus;
  actionStatus?: string;
  effectivenessStatus?: EffectivenessStatus;
  finalStatus?: string;
  ageingOpen?: number | null;
  ageingClosed?: number | null;
}

export interface ComplaintDetail extends ComplaintSummary {
  buildingStage?: string;
  closureDate?: string;
  originOfComplaint?: string;
  salesforceCapa?: string;
  area?: string;
  customerFinding?: string;
  serialNumbers?: string;
  pictureUrls?: string;

  // Phase 2: Assignment
  assignmentDeadline?: string;

  // Phase 3: Containment
  containmentAction?: string;
  containmentDueDate?: string;
  containmentOwner?: string;
  containmentCompletionDate?: string;
  containmentStatus?: string;

  // Phase 4: Root Cause
  rootCause?: string;
  rootCauseCategory?: string;
  rootCauseOwner?: string;
  rootCauseCompletionDate?: string;

  // Phase 5 & 6: CAPA
  correctiveAction?: string;
  preventiveAction?: string;
  correctivePreventiveAction?: string;
  actionOwner?: string;
  actionDueDate?: string;
  capaCompletionDate?: string;

  // Phase 7: Effectiveness Verification
  effectivenessVerifiedDate?: string;
  effectivenessVerifiedBy?: string;
  effectivenessRemarks?: string;

  // Phase 8: Closure
  finalEvidence?: string;
  remarks?: string;

  meetings: ComplaintMeeting[];
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt: string;
}

export interface ComplaintScheduleMeetingRequest {
  meetingDate: string; // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime?: string;    // HH:mm
  roomLocation: string;
  agenda: string;
  recipients: EmailRecipient[];
}

export interface PageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PageResponse<T> {
  content: T[];
  page: PageMetadata;
}

export const COMPLAINT_STAGE_META: Record<
  ComplaintStatus,
  {
    stage: number;
    title: string;
    description: string;
    badgeClass: string;
  }
> = {
  RECEIVED: {
    stage: 1,
    title: 'New Intake',
    description: 'Complaint recorded; ready for Cross-Functional Team review meeting',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  MEETING_SCHEDULED: {
    stage: 2,
    title: 'Meeting Scheduled',
    description: 'Meeting invitation and calendar file (.ics) dispatched to attendees',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  CONTAINMENT_COMMITTED: {
    stage: 3,
    title: 'Containment Committed',
    description: 'Interim containment actions deployed to isolate defect',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  ROOT_CAUSE_ANALYZED: {
    stage: 4,
    title: 'Root Cause Identified',
    description: 'Root cause confirmed via 5-Why and Fishbone investigation',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  CAPA_COMMITTED: {
    stage: 5,
    title: 'CAPA Committed',
    description: 'Permanent corrective and preventive action plan being implemented',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  EFFECTIVENESS_VERIFYING: {
    stage: 6,
    title: 'Effectiveness Verifying',
    description: 'Monitoring production and field data for zero recurrence',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  CLOSED: {
    stage: 7,
    title: 'Case Closed',
    description: 'Complaint verified, signed off, and archived',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};



export interface ComplaintUpdateRequest {
  controlNo?: string;
  buildingStage?: string;
  capaNo?: string;
  originOfComplaint?: string;
  internalExternal?: InternalExternal;
  salesforceCapa?: string;
  area?: string;
  customerName?: string;
  receivedDate?: string;
  customerFinding?: string;
  model?: string;
  issueDescription?: string;
  defectCategory?: string;
  defectName?: string;
  quantity?: number;
  serialNumbers?: string;
  pictureUrls?: string;
  pictureTmpKeys?: string[];

  // Phase 2: Assignment
  assignedTeam?: string;
  assignedPerson?: string;
  assignmentDeadline?: string;

  // Phase 3: Containment
  containmentAction?: string;
  containmentDueDate?: string;
  containmentOwner?: string;
  containmentCompletionDate?: string;
  containmentStatus?: string;

  // Phase 4: Root Cause
  rootCause?: string;
  rootCauseCategory?: string;
  rootCauseOwner?: string;
  rootCauseCompletionDate?: string;

  // Phase 5 & 6: CAPA
  correctiveAction?: string;
  preventiveAction?: string;
  correctivePreventiveAction?: string;
  actionOwner?: string;
  actionDueDate?: string;
  actionStatus?: string;
  capaCompletionDate?: string;

  // Phase 7: Effectiveness Verification
  effectivenessStatus?: EffectivenessStatus;
  effectivenessVerifiedDate?: string;
  effectivenessVerifiedBy?: string;
  effectivenessRemarks?: string;

  // Phase 8: Closure
  closureDate?: string;
  finalStatus?: string;
  finalEvidence?: string;
  finalEvidenceTmpKey?: string;
  remarks?: string;

  // Lifecycle Status
  status?: ComplaintStatus;
}