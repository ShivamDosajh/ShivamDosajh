import type { Config, Feedback, Session } from '../types';
import { monthKeyOf } from './date';

export interface EarningsRow {
  customerId: string;
  base: number;
  onTimeBonus: number;
  ratingBonus: number;
  total: number;
}

export interface EarningsResult {
  total: number;
  totals: { base: number; onTimeBonus: number; ratingBonus: number };
  rows: EarningsRow[];
}

export function calcEarnings(
  sessions: Session[],
  feedback: Feedback[],
  config: Config,
  month: string
): EarningsResult {
  const feedbackByCustomer = new Map(feedback.map((f) => [f.customerId, f]));
  const rows: EarningsRow[] = [];

  for (const session of sessions) {
    if (session.status !== 'COMPLETED' || !session.completedAt) continue;
    if (monthKeyOf(session.completedAt) !== month) continue;

    const base = config.incentives.base;
    const onTime = session.completedAt.slice(0, 10) <= session.dueDate;
    const onTimeBonus = onTime ? config.incentives.onTimeBonus : 0;

    const fb = feedbackByCustomer.get(session.customerId);
    let ratingBonus = 0;
    if (fb?.rating === 5) ratingBonus = config.incentives.ratingBonusFull;
    else if (fb?.rating === 4) ratingBonus = config.incentives.ratingBonusHalf;

    const total = base + onTimeBonus + ratingBonus;
    rows.push({ customerId: session.customerId, base, onTimeBonus, ratingBonus, total });
  }

  const totals = rows.reduce(
    (acc, r) => ({
      base: acc.base + r.base,
      onTimeBonus: acc.onTimeBonus + r.onTimeBonus,
      ratingBonus: acc.ratingBonus + r.ratingBonus,
    }),
    { base: 0, onTimeBonus: 0, ratingBonus: 0 }
  );

  const total = totals.base + totals.onTimeBonus + totals.ratingBonus;

  return { total, totals, rows };
}
