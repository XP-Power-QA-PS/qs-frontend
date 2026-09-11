import type { ComplaintDetail, ComplaintSummary } from '@/types/complaint/complaint.types';

export interface SlaInfo {
  statusText: string;
  isOverdue: boolean;
  isNearing: boolean;
  isCompleted: boolean;
  daysDiff: number; // positive = days overdue; negative = days left
  badgeClass: string;
  dotClass: string;
  message: string;
  phaseName: string;
  limitDays: number;
}

/**
 * Calculates the dynamic SLA status based on elapsed days (ageing) vs Jeanette 7-step SLA deadlines.
 * All stages allow early transition at any time without waiting.
 * Overdue indicators only fire when the deadline ceiling has been exceeded.
 */
export function computeSlaStatus(complaint: ComplaintSummary | ComplaintDetail): SlaInfo {
  if (complaint.status === 'CLOSED') {
    const isLate = complaint.ageingClosed != null && complaint.ageingClosed > 30;
    return {
      statusText: isLate ? 'Closed (Overdue)' : 'Closed (On-time)',
      isOverdue: false,
      isNearing: false,
      isCompleted: true,
      daysDiff: 0,
      badgeClass: isLate
        ? 'bg-amber-50 text-amber-800 border-amber-300'
        : 'bg-emerald-50 text-emerald-800 border-emerald-300',
      dotClass: isLate ? 'bg-amber-500' : 'bg-emerald-500',
      message: `Case closed in ${complaint.ageingClosed ?? 0} days.`,
      phaseName: 'Case Closed',
      limitDays: 30,
    };
  }

  const daysOpen = complaint.ageingOpen ?? 0;

  // SLA thresholds (Jeanette Standard from receivedDate)
  // Phase 1 (RECEIVED): 1 business day for CFT Preliminary Review
  // Phase 2 (MEETING_SCHEDULED): 2 business days (48h) for Containment Action
  // Phase 3 (CONTAINMENT_COMMITTED): 5 business days for Root Cause Analysis
  // Phase 4 (ROOT_CAUSE_ANALYZED): 10 business days for CAPA Commitment
  // Phase 5 (CAPA_COMMITTED): 30 days for Effectiveness Verification
  // Phase 6 (EFFECTIVENESS_VERIFYING): 30 days for Final Sign-off & Closure

  let limitDays = 1;
  let phaseName = 'Preliminary Review';
  let targetAction = 'Schedule CFT preliminary review within 1 business day';

  switch (complaint.status) {
    case 'RECEIVED':
      limitDays = 1;
      phaseName = 'Preliminary Review (1d)';
      targetAction = 'Schedule CFT preliminary review within 1 business day';
      break;
    case 'MEETING_SCHEDULED':
      limitDays = 2;
      phaseName = 'Containment Action (2d)';
      targetAction = 'Issue interim containment action within 48h';
      break;
    case 'CONTAINMENT_COMMITTED':
      limitDays = 5;
      phaseName = 'Root Cause (5d)';
      targetAction = 'Complete 5-Why root cause analysis within 5 business days';
      break;
    case 'ROOT_CAUSE_ANALYZED':
      limitDays = 10;
      phaseName = 'CAPA Plan (10d)';
      targetAction = 'Commit corrective and preventive action plan within 10 business days';
      break;
    case 'CAPA_COMMITTED':
      limitDays = 30;
      phaseName = 'Effectiveness Verification (30d)';
      targetAction = 'Monitor and verify corrective action effectiveness for 30 days';
      break;
    case 'EFFECTIVENESS_VERIFYING':
      limitDays = 35;
      phaseName = 'Case Closure & Sign-off';
      targetAction = 'Compile evidence and submit for customer sign-off & closure';
      break;
  }

  const daysOverdue = daysOpen - limitDays;

  if (daysOverdue > 0) {
    return {
      statusText: `⚠️ ${daysOverdue}d Overdue (${phaseName})`,
      isOverdue: true,
      isNearing: false,
      isCompleted: false,
      daysDiff: daysOverdue,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-300 font-bold animate-pulse',
      dotClass: 'bg-rose-600',
      message: `Case exceeded ${phaseName} deadline by ${daysOverdue} business day(s)! ${targetAction}.`,
      phaseName,
      limitDays,
    };
  } else if (daysOverdue === 0) {
    return {
      statusText: `Due Today (${phaseName})`,
      isOverdue: false,
      isNearing: true,
      isCompleted: false,
      daysDiff: 0,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
      dotClass: 'bg-amber-500',
      message: `Today is the SLA deadline for ${phaseName}! ${targetAction}.`,
      phaseName,
      limitDays,
    };
  } else {
    const daysLeft = Math.abs(daysOverdue);
    return {
      statusText: `${daysLeft}d Remaining (${phaseName})`,
      isOverdue: false,
      isNearing: daysLeft <= 1,
      isCompleted: false,
      daysDiff: -daysLeft,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium',
      dotClass: 'bg-emerald-500',
      message: `On track (${daysLeft} business day(s) remaining for ${phaseName}).`,
      phaseName,
      limitDays,
    };
  }
}
