import { useMemo } from 'react';
import { useAppData } from '../lib/AppDataContext';
import { calcEarnings } from '../lib/earnings';
import { currentMonthKey, formatDateDisplay } from '../lib/date';

export default function Earnings() {
  const { config, customers, sessions, feedback } = useAppData();

  const result = useMemo(() => {
    if (!config) return null;
    return calcEarnings(sessions, feedback, config, currentMonthKey());
  }, [sessions, feedback, config]);

  if (!config || !result) return null;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Earnings</h1>

      <div className="bg-primary text-white rounded-xl p-5 shadow-sm text-center">
        <div className="text-xs opacity-80">This month</div>
        <div className="text-4xl font-bold mt-1">₹{result.total.toLocaleString('en-IN')}</div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Breakdown</h2>
        <BreakdownRow label="Base" value={result.totals.base} />
        <BreakdownRow label="On-time bonus" value={result.totals.onTimeBonus} />
        <BreakdownRow label="Rating bonus" value={result.totals.ratingBonus} />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Contributing sessions</h2>
        {result.rows.length === 0 ? (
          <p className="text-sm text-gray-400">No completed sessions this month yet.</p>
        ) : (
          <div className="space-y-2">
            {result.rows.map((row) => {
              const customer = customers.find((c) => c.id === row.customerId);
              const session = sessions.find((s) => s.customerId === row.customerId);
              return (
                <div key={row.customerId} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="text-gray-900 font-medium">{customer?.name || row.customerId}</div>
                    <div className="text-xs text-gray-400">
                      {session?.completedAt ? formatDateDisplay(session.completedAt.slice(0, 10)) : ''}
                    </div>
                  </div>
                  <div className="text-gray-900 font-medium">₹{row.total}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">These are estimates only, for demo purposes.</p>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium">₹{value.toLocaleString('en-IN')}</span>
    </div>
  );
}
