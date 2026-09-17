import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppData } from '../lib/AppDataContext';
import { computeDueFlag } from '../lib/dueFlag';
import { formatDateDisplay } from '../lib/date';
import StatusChip from '../components/StatusChip';
import StarRating from '../components/StarRating';

type Tab = 'pending' | 'scheduled' | 'completed';

export default function Sessions() {
  const { config, customers, sessions, feedback } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  const tab = (searchParams.get('tab') as Tab) || 'pending';

  const setTab = (t: Tab) => setSearchParams({ tab: t });

  const rows = useMemo(() => {
    if (!config) return [];
    const statusMap: Record<Tab, string> = {
      pending: 'PENDING',
      scheduled: 'SCHEDULED',
      completed: 'COMPLETED',
    };
    return sessions
      .filter((s) => s.status === statusMap[tab])
      .map((s) => ({
        session: s,
        customer: customers.find((c) => c.id === s.customerId)!,
        flag: computeDueFlag(s, config.dueSoonDays),
        fb: feedback.find((f) => f.customerId === s.customerId),
      }))
      .filter((r) => r.customer)
      .sort((a, b) => {
        if (tab === 'completed') {
          return (b.session.completedAt || '').localeCompare(a.session.completedAt || '');
        }
        return a.session.dueDate.localeCompare(b.session.dueDate);
      });
  }, [sessions, customers, feedback, tab, config]);

  const avgRating = useMemo(() => {
    if (tab !== 'completed' || feedback.length === 0) return null;
    const rated = rows.map((r) => r.fb).filter(Boolean) as { rating: number }[];
    if (rated.length === 0) return null;
    return rated.reduce((s, f) => s + f.rating, 0) / rated.length;
  }, [rows, tab, feedback]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Sessions</h1>

      <div className="flex bg-white rounded-xl p-1 shadow-sm">
        {(['pending', 'scheduled', 'completed'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize tap-target ${
              tab === t ? 'bg-primary text-white' : 'text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'completed' && avgRating !== null && (
        <div className="text-sm text-gray-600">Average rating: <span className="font-semibold text-gray-900">{avgRating.toFixed(1)} ★</span></div>
      )}

      {rows.length === 0 && (
        <div className="bg-white rounded-xl p-6 text-center text-sm text-gray-400 shadow-sm">Nothing here yet.</div>
      )}

      <div className="space-y-2">
        {rows.map(({ session, customer, flag, fb }) => {
          if (tab === 'completed') {
            const isExpanded = expanded === customer.id;
            return (
              <div key={customer.id} className="bg-white rounded-xl p-3 shadow-sm">
                <button
                  className="w-full text-left flex items-center justify-between"
                  onClick={() => setExpanded(isExpanded ? null : customer.id)}
                >
                  <div>
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-xs text-gray-500">
                      {session.completedAt ? formatDateDisplay(session.completedAt.slice(0, 10)) : ''} · {customer.carModel}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <StatusChip flag={flag} />
                    <div>
                      {fb ? <StarRating rating={fb.rating} /> : <span className="text-xs text-gray-400">Awaiting feedback</span>}
                    </div>
                  </div>
                </button>
                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-gray-100 text-sm text-gray-600">
                    {fb?.comment || (fb ? 'No comment left.' : 'Feedback not received yet.')}
                  </div>
                )}
              </div>
            );
          }
          return (
            <button
              key={customer.id}
              onClick={() => navigate(`/customer/${customer.id}`)}
              className="w-full bg-white rounded-xl p-3 shadow-sm text-left flex items-center justify-between tap-target"
            >
              <div>
                <div className="font-medium text-gray-900">{customer.name}</div>
                <div className="text-xs text-gray-500">
                  {customer.carModel}
                  {session.appointment ? ` · ${formatDateDisplay(session.appointment.date)}, ${session.appointment.time}` : ''}
                </div>
              </div>
              <StatusChip flag={flag} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
