import { Modal } from "../common/Modal";
import { Toggle } from "../common/Toggle";

export type FilterKey = "megaCharger" | "available" | "fast" | "paymentEnabled";

const options: { key: FilterKey; label: string }[] = [
  { key: "megaCharger", label: "TATA.ev Mega Charger" },
  { key: "available", label: "Available" },
  { key: "fast", label: "Fast Charging" },
  { key: "paymentEnabled", label: "Payment Enabled" },
];

interface FiltersModalProps {
  open: boolean;
  onClose: () => void;
  active: Set<FilterKey>;
  onToggle: (key: FilterKey) => void;
  onClearAll: () => void;
}

export function FiltersModal({ open, onClose, active, onToggle, onClearAll }: FiltersModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Filters">
      <div className="flex flex-col gap-4">
        {options.map((opt) => (
          <div key={opt.key} className="flex items-center justify-between gap-3">
            <span className="text-text text-[14px] flex-1 min-w-0 pr-2">{opt.label}</span>
            <Toggle checked={active.has(opt.key)} onChange={() => onToggle(opt.key)} label={opt.label} />
          </div>
        ))}
        <button onClick={onClearAll} className="text-primary text-[14px] font-medium text-left mt-1">
          clear all filters
        </button>
      </div>
    </Modal>
  );
}
