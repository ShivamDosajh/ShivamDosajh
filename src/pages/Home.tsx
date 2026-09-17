import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { useAppData } from '../lib/AppDataContext';
import { computeDueFlag } from '../lib/dueFlag';
import { calcEarnings } from '../lib/earnings';
import { currentMonthKey, todayISO, formatDateDisplay } from '../lib/date';

export default function Home() {
  const { config, customers, sessions, feedback } = useAppData();
  const navigate = useNavigate();

  const counts = useMemo(() => {
    if (!config) return { pending: 0, overdue: 0, scheduled: 0, completed: 0 };
    let pending = 0, overdue = 0, scheduled = 0, completed = 0;
    for (const s of sessions) {
      if (s.status === 'PENDING') pending++;
      if (s.status === 'SCHEDULED') scheduled++;
      if (s.status === 'COMPLETED') completed++;
      if (s.status !== 'COMPLETED' && computeDueFlag(s, config.dueSoonDays) === 'OVERDUE') overdue++;
    }
    return { pending, overdue, scheduled, completed };
  }, [sessions, config]);

  const todaysVisits = useMemo(() => {
    const today = todayISO();
    return sessions
      .filter((s) => s.appointment?.date === today && s.status !== 'COMPLETED')
      .map((s) => ({ session: s, customer: customers.find((c) => c.id === s.customerId) }))
      .filter((v) => v.customer)
      .sort((a, b) => (a.session.appointment!.time > b.session.appointment!.time ? 1 : -1));
  }, [sessions, customers]);

  const summary = useMemo(() => {
    if (!config) return { avgRating: 0, earned: 0 };
    const avgRating = feedback.length
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
      : 0;
    const earned = calcEarnings(sessions, feedback, config, currentMonthKey()).total;
    return { avgRating, earned };
  }, [sessions, feedback, config]);

  if (!config) return null;

  const tiles = [
    { label: 'Pending', value: counts.pending, tab: 'pending', color: 'text-gray-700' },
    { label: 'Overdue', value: counts.overdue, tab: 'pending', color: 'text-red-600' },
    { label: 'Scheduled', value: counts.scheduled, tab: 'scheduled', color: 'text-primary' },
    { label: 'Completed', value: counts.completed, tab: 'completed', color: 'text-green-600' },
  ];

  return (
    <div className="p-4 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Hi, {config.advisorName}</h1>
        <p className="text-sm text-gray-500">{formatDateDisplay(todayISO())} · {config.dealership}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <button
            key={t.label}
            onClick={() => navigate(`/sessions?tab=${t.tab}`)}
            className="bg-white rounded-xl p-4 text-left shadow-sm active:scale-[0.98] transition-transform tap-target"
          >
            <div className={`text-2xl font-bold ${t.color}`}>{t.value}</div>
            <div className="text-sm text-gray-500">{t.label}</div>
          </button>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Today's visits</h2>
        {todaysVisits.length === 0 ? (
          <div className="bg-white rounded-xl p-4 text-sm text-gray-400 shadow-sm">No visits scheduled for today.</div>
        ) : (
          <div className="space-y-2">
            {todaysVisits.map(({ session, customer }) => (
              <div key={session.customerId} className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm">
                <button
                  className="text-left flex-1"
                  onClick={() => navigate(`/customer/${customer!.id}`)}
                >
                  <div className="font-medium text-gray-900">{customer!.name}</div>
                  <div className="text-xs text-gray-500">{session.appointment!.time} · {customer!.carModel}</div>
                </button>
                <a
                  href={`tel:${customer!.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2.5 rounded-full bg-primary-light text-primary tap-target"
                  aria-label="Call"
                >
                  <Phone size={18} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-primary text-white rounded-xl p-4 shadow-sm flex justify-between items-center">
        <div>
          <div className="text-xs opacity-80">This month</div>
          <div className="text-lg font-semibold">₹{summary.earned.toLocaleString('en-IN')}</div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-80">Avg rating</div>
          <div className="text-lg font-semibold">{summary.avgRating ? summary.avgRating.toFixed(1) : '—'} ★</div>
        </div>
      </div>
    </div>
  );
}
