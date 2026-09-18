import { ComplianceItem } from '../types';

/**
 * Parses human dates like "20 Sep 2026" or "31 Oct 2026" to ISO "YYYY-MM-DD"
 */
function parseDeadlineDateToIso(deadlineStr?: string): string | null {
  if (!deadlineStr || deadlineStr === 'End of Month' || deadlineStr === 'Daily' || deadlineStr === 'Weekly') {
    return null;
  }
  const parts = deadlineStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const monthMap: Record<string, string> = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };
    const month = monthMap[parts[1]];
    const year = parts[2];
    if (month && year && /^\d{4}$/.test(year) && /^\d{2}$/.test(day)) {
      return `${year}-${month}-${day}`;
    }
  }
  return null;
}

/**
 * Checks if a compliance item is completely filed (Subtask 3 completed)
 */
export function isComplianceFiled(item: ComplianceItem): boolean {
  return Boolean(item.subtasks && item.subtasks[2]?.status === 'completed');
}

/**
 * Returns the active or next statutory due date for a compliance item in ISO (YYYY-MM-DD) format
 */
export function nextDueDate(item: ComplianceItem): string | null {
  if (!item.dueDates || item.dueDates.length === 0) {
    // Fallback: try parsing from subtask 3 deadline if present
    const parsedSubtaskDate = parseDeadlineDateToIso(item.subtasks?.[2]?.deadline);
    if (parsedSubtaskDate) return parsedSubtaskDate;
    return null;
  }

  if (item.dueDates.length === 1) {
    return item.dueDates[0];
  }

  // If subtask 3 specifies a deadline that matches one of the due dates, that is the exact cycle date
  const parsedSubtaskDate = parseDeadlineDateToIso(item.subtasks?.[2]?.deadline);
  if (parsedSubtaskDate && item.dueDates.includes(parsedSubtaskDate)) {
    return parsedSubtaskDate;
  }

  // Otherwise evaluate relative to today
  const todayIso = new Date().toISOString().split('T')[0];
  const sortedDates = [...item.dueDates].sort();

  if (isComplianceFiled(item)) {
    // For filed items, pick the latest applicable date that has passed or the parsed date
    const pastDates = sortedDates.filter(d => d <= todayIso);
    return pastDates.length > 0 ? pastDates[pastDates.length - 1] : sortedDates[0];
  }

  // For unfiled items:
  // First look for upcoming dates (>= today)
  const upcomingDates = sortedDates.filter(d => d >= todayIso);
  if (upcomingDates.length > 0) {
    return upcomingDates[0];
  }

  // If all dates in dueDates are in the past and item is still unfiled, it is overdue
  return sortedDates[sortedDates.length - 1];
}

/**
 * Returns the integer number of calendar days from reference date (default: now) until the next due date.
 * Positive = future, 0 = today, Negative = overdue.
 */
export function daysUntilDue(item: ComplianceItem, referenceDate?: Date): number | null {
  const due = nextDueDate(item);
  if (!due) return null;

  const targetParts = due.split('-').map(Number);
  const targetMidnight = new Date(targetParts[0], targetParts[1] - 1, targetParts[2]).getTime();

  const ref = referenceDate ? new Date(referenceDate) : new Date();
  const refMidnight = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate()).getTime();

  const diffMs = targetMidnight - refMidnight;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Returns status:
 * - 'filed': if subtask 3 is marked completed
 * - 'overdue': if past due date and not filed (< 0 days)
 * - 'due-soon': within 7 days (0 to 7 days remaining)
 * - 'upcoming': more than 7 days away
 */
export function dueStatus(
  item: ComplianceItem,
  referenceDate?: Date
): 'overdue' | 'due-soon' | 'upcoming' | 'filed' {
  if (isComplianceFiled(item)) {
    return 'filed';
  }

  const days = daysUntilDue(item, referenceDate);
  if (days === null) {
    return 'upcoming';
  }
  if (days < 0) {
    return 'overdue';
  }
  if (days <= 7) {
    return 'due-soon';
  }
  return 'upcoming';
}

/**
 * Formats an ISO string (YYYY-MM-DD) to "DD Mon YYYY" (e.g., "20 Sep 2026")
 */
export function formatDueDate(isoString: string | null): string {
  if (!isoString) return '—';
  const parts = isoString.split('-');
  if (parts.length !== 3) return isoString;

  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[monthIdx] || parts[1];

  return `${day} ${monthName} ${year}`;
}

/**
 * Comparator to sort compliance items ascending by their next due date
 */
export function compareDueDates(a: ComplianceItem, b: ComplianceItem): number {
  const dateA = nextDueDate(a);
  const dateB = nextDueDate(b);

  if (!dateA && !dateB) return 0;
  if (!dateA) return 1;
  if (!dateB) return -1;

  return dateA.localeCompare(dateB);
}
