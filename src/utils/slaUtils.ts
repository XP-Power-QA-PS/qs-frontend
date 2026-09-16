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
    const closedDays = complaint.ageingClosed ?? 0;
    return {
      statusText: `Closed (${closedDays}d)`,
      isOverdue: false,
      isNearing: false,
      isCompleted: true,
      daysDiff: 0,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium',
      dotClass: 'bg-emerald-500',
      message: `Case resolved and closed in ${closedDays} days.`,
      phaseName: 'Case Closed',
      limitDays: 30,
    };
  }

  const daysOpen = complaint.ageingOpen ?? 0;
  const isHighAgeing = daysOpen > 14;
  const isModerateAgeing = daysOpen > 7;

  let badgeClass = 'bg-blue-50 text-blue-800 border-blue-200 font-medium';
  let dotClass = 'bg-blue-500';
  let statusText = `Open ${daysOpen}d`;

  if (isHighAgeing) {
    badgeClass = 'bg-rose-50 text-rose-700 border-rose-300 font-semibold';
    dotClass = 'bg-rose-500';
    statusText = `⚠️ Open ${daysOpen}d`;
  } else if (isModerateAgeing) {
    badgeClass = 'bg-amber-50 text-amber-800 border-amber-300 font-medium';
    dotClass = 'bg-amber-500';
    statusText = `Open ${daysOpen}d`;
  }

  return {
    statusText,
    isOverdue: isHighAgeing,
    isNearing: isModerateAgeing,
    isCompleted: false,
    daysDiff: daysOpen,
    badgeClass,
    dotClass,
    message: `Complaint has been open for ${daysOpen} day(s) since received date.`,
    phaseName: complaint.status,
    limitDays: 14,
  };
}


