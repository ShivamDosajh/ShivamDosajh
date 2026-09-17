import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useSop } from '../lib/useSop';
import { useAppData } from '../lib/AppDataContext';
import { useToast } from '../lib/ToastContext';

export default function Guide() {
  const sop = useSop();
  const { resetAll } = useAppData();
  const { showToast } = useToast();
  const [open, setOpen] = useState<string | null>('before');
  const [resetting, setResetting] = useState(false);

  if (!sop) return <div className="p-4 text-gray-500">Loading…</div>;

  const toggle = (key: string) => setOpen((o) => (o === key ? null : key));

  const handleReset = async () => {
    setResetting(true);
    await resetAll();
    setResetting(false);
    showToast('Demo data reset');
  };

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold text-gray-900">Guide</h1>

      <Accordion id="before" open={open} onToggle={toggle} title="Before the visit">
        <div className="space-y-2">
          {sop.steps.map((s) => (
            <p key={s.id} className="text-sm text-gray-600">
              <span className="font-medium text-gray-800">{s.title}:</span> {s.tips[0]}
            </p>
          ))}
        </div>
      </Accordion>

      <Accordion id="steps" open={open} onToggle={toggle} title="The 5 steps">
        <div className="space-y-4">
          {sop.steps.map((s) => (
            <div key={s.id}>
              <h3 className="font-medium text-gray-900 text-sm">{s.title} <span className="text-gray-400 font-normal">({s.duration})</span></h3>
              <ul className="mt-1 space-y-1">
                {s.checklist.map((item) => (
                  <li key={item.id} className="text-sm text-gray-600">• {item.label}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion id="dos" open={open} onToggle={toggle} title="DOs">
        <ul className="space-y-1">
          {sop.dos.map((d, i) => (
            <li key={i} className="text-sm text-gray-600">• {d}</li>
          ))}
        </ul>
      </Accordion>

      <Accordion id="donts" open={open} onToggle={toggle} title="DON'Ts">
        <ul className="space-y-1">
          {sop.donts.map((d, i) => (
            <li key={i} className="text-sm text-gray-600">• {d}</li>
          ))}
        </ul>
      </Accordion>

      <Accordion id="faq" open={open} onToggle={toggle} title="Charger problems">
        <div className="space-y-2">
          {sop.faq.map((f, i) => (
            <div key={i} className="text-sm">
              <span className="font-medium text-gray-800">{f.problem}:</span>{' '}
              <span className="text-gray-600">{f.action}</span>
            </div>
          ))}
        </div>
      </Accordion>

      <button
        onClick={handleReset}
        disabled={resetting}
        className="w-full mt-4 bg-red-50 text-red-600 rounded-xl py-3 font-medium tap-target disabled:opacity-50"
      >
        {resetting ? 'Resetting…' : 'Reset demo data'}
      </button>
    </div>
  );
}

function Accordion({
  id,
  open,
  onToggle,
  title,
  children,
}: {
  id: string;
  open: string | null;
  onToggle: (id: string) => void;
  title: string;
  children: React.ReactNode;
}) {
  const isOpen = open === id;
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button onClick={() => onToggle(id)} className="w-full flex items-center justify-between p-4 tap-target">
        <span className="font-medium text-gray-900">{title}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
