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
  status: ComplaintStatus;
  actionStatus?: string;
  finalStatus?: string;
  ageingOpen?: number | null;
  ageingClosed?: number | null;
}

export interface ComplaintDetail extends ComplaintSummary {
  buildingStage?: string;
  capaNo?: string;
  closureDate?: string;
  originOfComplaint?: string;
  salesforceCapa?: string;
  area?: string;
  customerFinding?: string;
  serialNumbers?: string;
  pictureUrls?: string;
  rootCause?: string;
  containmentAction?: string;
  containmentDueDate?: string;
  correctivePreventiveAction?: string;
  actionOwner?: string;
  actionDueDate?: string;
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
    sla: string;
    badgeClass: string;
  }
> = {
  RECEIVED: {
    stage: 1,
    title: 'New Intake',
    description: 'Awaiting CQE to convene CFT & schedule preliminary review',
    sla: 'Meeting SLA: 1 business day',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  MEETING_SCHEDULED: {
    stage: 2,
    title: 'Meeting Scheduled',
    description: 'CFT invitation dispatched; awaiting interim containment commit',
    sla: 'Containment SLA: 2 business days (48h)',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  CONTAINMENT_COMMITTED: {
    stage: 3,
    title: 'Containment Committed',
    description: 'Defect isolated; 5-Why root cause analysis in progress',
    sla: 'Root Cause SLA: 5 business days',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  ROOT_CAUSE_ANALYZED: {
    stage: 4,
    title: 'Root Cause Identified',
    description: 'Root cause verified; formulating permanent CAPA plan',
    sla: 'CAPA SLA: 10 business days',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  CAPA_COMMITTED: {
    stage: 5,
    title: 'CAPA Committed',
    description: 'Corrective actions deployed; monitoring 30-day effectiveness',
    sla: 'Verification SLA: 30 days',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  EFFECTIVENESS_VERIFYING: {
    stage: 6,
    title: 'Effectiveness Verification',
    description: 'Collecting evidence confirming zero defect recurrence',
    sla: 'Closure SLA: 7 days post-verification',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  CLOSED: {
    stage: 7,
    title: 'Case Closed',
    description: 'All 8D stages verified, finalized and archived',
    sla: 'Completed',
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
  customerFinding?: string;
  model?: string;
  issueDescription?: string;
  defectCategory?: string;
  defectName?: string;
  quantity?: number;
  serialNumbers?: string;
  pictureUrls?: string;

  // Phase 3: Containment
  containmentAction?: string;
  containmentDueDate?: string;

  // Phase 4: Root Cause
  rootCause?: string;

  // Phase 5 & 6: CAPA
  correctivePreventiveAction?: string;
  actionOwner?: string;
  actionDueDate?: string;
  actionStatus?: string;

  // Phase 7: Closure
  closureDate?: string;
  finalStatus?: string;
  remarks?: string;

  // Lifecycle Status
  status?: ComplaintStatus;
}
