import type { DueFlag, Session } from '../types';
import { daysBetween, todayISO } from './date';

export function computeDueFlag(session: Session, dueSoonDays: number): DueFlag {
  if (session.status === 'COMPLETED' && session.completedAt) {
    const completedDate = session.completedAt.slice(0, 10);
    return daysBetween(session.dueDate, completedDate) <= 0 ? 'ON_TIME' : 'LATE';
  }
  const daysLeft = daysBetween(todayISO(), session.dueDate);
  if (daysLeft < 0) return 'OVERDUE';
  if (daysLeft <= dueSoonDays) return 'DUE_SOON';
  return 'ON_TRACK';
}

export const DUE_FLAG_LABEL: Record<DueFlag, string> = {
  ON_TRACK: 'On track',
  DUE_SOON: 'Due soon',
  OVERDUE: 'Overdue',
  ON_TIME: 'On time',
  LATE: 'Late',
};

export const DUE_FLAG_CLASSES: Record<DueFlag, string> = {
  ON_TRACK: 'bg-green-100 text-green-700',
  DUE_SOON: 'bg-amber-100 text-amber-700',
  OVERDUE: 'bg-red-100 text-red-700',
  ON_TIME: 'bg-green-100 text-green-700',
  LATE: 'bg-red-100 text-red-700',
};
