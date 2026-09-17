import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Navigation2 } from 'lucide-react';
import { useAppData } from '../lib/AppDataContext';
import { computeDueFlag } from '../lib/dueFlag';
import { formatDateDisplay, formatDateTimeDisplay, todayISO } from '../lib/date';
import StatusChip from '../components/StatusChip';
import StarRating from '../components/StarRating';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { config, getCustomer, getSession, getFeedback, scheduleAppointment, startSession } = useAppData();

  const customer = getCustomer(id!);
  const session = getSession(id!);

  const [date, setDate] = useState(session?.appointment?.date || todayISO());
  const [time, setTime] = useState(session?.appointment?.time || '10:00');
  const [notes, setNotes] = useState(session?.appointment?.notes || '');

  if (!customer || !session || !config) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Customer not found.</p>
      </div>
    );
  }

  const flag = computeDueFlag(session, config.dueSoonDays);
  const feedback = getFeedback(id!);

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleAppointment(customer.id, { date, time, notes: notes.trim() || undefined });
  };

  const handleStart = () => {
    if (session.status !== 'IN_PROGRESS') startSession(customer.id);
    navigate(`/run/${customer.id}`);
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${customer.lat},${customer.lng}`;

  return (
    <div className="pb-4">
      <div className="p-4 flex items-center gap-2 bg-white shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 tap-target" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{customer.name}</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
          <Row label="Phone" value={customer.phone} />
          <Row label="Address" value={`${customer.address}, ${customer.area}`} />
          <Row label="Car model" value={customer.carModel} />
          <Row label="Delivery date" value={formatDateDisplay(customer.deliveryDate)} />
          <Row label="Due date" value={formatDateDisplay(session.dueDate)} />
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm text-gray-500">Status</span>
            <StatusChip flag={flag} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${customer.phone}`}
            className="flex items-center justify-center gap-2 bg-primary-light text-primary rounded-xl py-3 font-medium tap-target"
          >
            <Phone size={18} /> Call
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-primary-light text-primary rounded-xl py-3 font-medium tap-target"
          >
            <Navigation2 size={18} /> Navigate
          </a>
        </div>

        {session.status === 'COMPLETED' ? (
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
            <h2 className="font-semibold text-gray-900">Charge details</h2>
            {session.charge ? (
              <>
                <Row label="Charger" value={session.charge.chargerName} />
                <Row label="Start / End %" value={`${session.charge.startPct}% → ${session.charge.endPct}%`} />
                <Row label="Energy" value={`${session.charge.kwh} kWh`} />
                <Row label="Amount" value={`₹${session.charge.amountInr}`} />
              </>
            ) : (
              <p className="text-sm text-gray-400">No charge details recorded.</p>
            )}
            <div className="pt-2 border-t border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-1">Feedback</h2>
              {feedback ? (
                <div className="space-y-1">
                  <StarRating rating={feedback.rating} />
                  {feedback.comment && <p className="text-sm text-gray-600">{feedback.comment}</p>}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Awaiting feedback</p>
              )}
            </div>
            <p className="text-xs text-gray-400 pt-1">
              Completed {session.completedAt ? formatDateTimeDisplay(session.completedAt) : ''}
            </p>
          </div>
        ) : (
          <>
            {session.status !== 'IN_PROGRESS' && (
              <form onSubmit={handleSchedule} className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                <h2 className="font-semibold text-gray-900">Schedule visit</h2>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm text-gray-600">
                    Date
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 tap-target"
                      required
                    />
                  </label>
                  <label className="text-sm text-gray-600">
                    Time
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 tap-target"
                      required
                    />
                  </label>
                </div>
                <label className="text-sm text-gray-600 block">
                  Notes
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
                    rows={2}
                  />
                </label>
                <button type="submit" className="w-full bg-primary text-white rounded-xl py-3 font-medium tap-target">
                  {session.appointment ? 'Update schedule' : 'Save schedule'}
                </button>
              </form>
            )}

            <button
              onClick={handleStart}
              className="w-full bg-primary-dark text-white rounded-xl py-3 font-medium tap-target"
            >
              {session.status === 'IN_PROGRESS' ? 'Resume session' : 'Start session'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value}</span>
    </div>
  );
}
