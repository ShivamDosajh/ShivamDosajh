import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppData } from '../lib/AppDataContext';
import { useSop } from '../lib/useSop';
import { useToast } from '../lib/ToastContext';

export default function SessionRunner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sop = useSop();
  const { getCustomer, getSession, toggleChecklistItem, setCurrentStep, setCharge, completeSession } = useAppData();
  const { showToast } = useToast();
  const [tipsOpen, setTipsOpen] = useState(false);

  const customer = getCustomer(id!);
  const session = getSession(id!);

  const [chargerName, setChargerName] = useState(session?.charge?.chargerName || '');
  const [startPct, setStartPct] = useState(session?.charge?.startPct?.toString() || '');
  const [endPct, setEndPct] = useState(session?.charge?.endPct?.toString() || '');
  const [kwh, setKwh] = useState(session?.charge?.kwh?.toString() || '');
  const [amountInr, setAmountInr] = useState(session?.charge?.amountInr?.toString() || '');

  const step = sop && session ? sop.steps[session.currentStep] : null;

  const allChecked = useMemo(() => {
    if (!step || !session) return false;
    return step.checklist.every((item) => session.checklist[item.id]);
  }, [step, session]);

  const chargeFieldsValid =
    chargerName.trim() !== '' && startPct !== '' && endPct !== '' && kwh !== '' && amountInr !== '';

  if (!sop || !customer || !session) {
    return <div className="p-4 text-gray-500">Loading…</div>;
  }

  const isChargeStep = step!.id === 3;
  const isLastStep = session.currentStep === sop.steps.length - 1;
  const nextDisabled = !allChecked || (isChargeStep && !chargeFieldsValid);

  const persistCharge = () => {
    if (!isChargeStep) return;
    setCharge(customer.id, {
      chargerName: chargerName.trim(),
      startPct: Number(startPct),
      endPct: Number(endPct),
      kwh: Number(kwh),
      amountInr: Number(amountInr),
    });
  };

  const handleToggle = (itemId: string, checked: boolean) => {
    toggleChecklistItem(customer.id, itemId, checked);
  };

  const handleNext = () => {
    persistCharge();
    setCurrentStep(customer.id, session.currentStep + 1);
    setTipsOpen(false);
  };

  const handleBack = () => {
    if (session.currentStep === 0) {
      navigate(`/customer/${customer.id}`);
      return;
    }
    persistCharge();
    setCurrentStep(customer.id, session.currentStep - 1);
    setTipsOpen(false);
  };

  const handleComplete = () => {
    persistCharge();
    completeSession(customer.id);
    showToast('Session completed — great work!');
    navigate('/sessions?tab=completed');
  };

  const progressPct = ((session.currentStep + 1) / sop.steps.length) * 100;

  return (
    <div className="pb-4">
      <div className="p-4 bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={handleBack} className="p-2 -ml-2 tap-target" aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-semibold text-gray-900">{customer.name}</h1>
            <p className="text-xs text-gray-500">Step {session.currentStep + 1} of {sop.steps.length}</p>
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{step!.title}</h2>
          <p className="text-xs text-gray-500 mb-3">{step!.duration}</p>

          <div className="space-y-2">
            {step!.checklist.map((item) => (
              <label key={item.id} className="flex items-start gap-3 py-2 tap-target cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!session.checklist[item.id]}
                  onChange={(e) => handleToggle(item.id, e.target.checked)}
                  className="mt-0.5 w-5 h-5 accent-[#0B5563] shrink-0"
                />
                <span className="text-sm text-gray-800">{item.label}</span>
              </label>
            ))}
          </div>

          {isChargeStep && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
              <label className="text-sm text-gray-600 col-span-2">
                Charger name
                <input
                  type="text"
                  value={chargerName}
                  onChange={(e) => setChargerName(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 tap-target"
                  placeholder="e.g. Statiq - Kothrud Mall"
                />
              </label>
              <label className="text-sm text-gray-600">
                Start %
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={startPct}
                  onChange={(e) => setStartPct(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 tap-target"
                />
              </label>
              <label className="text-sm text-gray-600">
                End %
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={endPct}
                  onChange={(e) => setEndPct(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 tap-target"
                />
              </label>
              <label className="text-sm text-gray-600">
                kWh
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={kwh}
                  onChange={(e) => setKwh(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 tap-target"
                />
              </label>
              <label className="text-sm text-gray-600">
                Amount (₹)
                <input
                  type="number"
                  min={0}
                  value={amountInr}
                  onChange={(e) => setAmountInr(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 tap-target"
                />
              </label>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => setTipsOpen((o) => !o)}
            className="w-full flex items-center justify-between p-4 tap-target"
          >
            <span className="text-sm font-medium text-primary">Tips</span>
            {tipsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {tipsOpen && (
            <div className="px-4 pb-4 space-y-1">
              {step!.tips.map((tip, i) => (
                <p key={i} className="text-sm text-gray-600">• {tip}</p>
              ))}
            </div>
          )}
        </div>

        {isLastStep ? (
          <button
            onClick={handleComplete}
            disabled={nextDisabled}
            className="w-full bg-primary text-white rounded-xl py-3 font-medium tap-target disabled:opacity-40"
          >
            Complete session
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={nextDisabled}
            className="w-full bg-primary text-white rounded-xl py-3 font-medium tap-target disabled:opacity-40"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
