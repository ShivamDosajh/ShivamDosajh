import { Modal } from "../common/Modal";

const items = [
  { color: "bg-primary", label: "Available charger" },
  { color: "bg-orange-400", label: "TATA.ev Mega Charger" },
  { color: "bg-secondaryText", label: "Unavailable / offline" },
  { color: "bg-black border border-white", label: "Your vehicle" },
];

export function MapLegend({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Map legend">
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3">
            <span className={`w-4 h-4 rounded-full ${item.color}`} />
            <span className="text-text text-sm">{item.label}</span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
