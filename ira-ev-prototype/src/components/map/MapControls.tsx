import type { ReactNode } from "react";
import { Car, LocateFixed, List, RefreshCw } from "lucide-react";

interface MapControlsProps {
  onVehicle: () => void;
  onLocate: () => void;
  onLegend: () => void;
  onRefresh: () => void;
}

function ControlButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-11 h-11 rounded-full bg-black/85 backdrop-blur flex items-center justify-center text-white shadow-lg active:opacity-70"
    >
      {children}
    </button>
  );
}

export function MapControls({ onVehicle, onLocate, onLegend, onRefresh }: MapControlsProps) {
  return (
    <div className="absolute right-4 bottom-6 flex flex-col gap-3 z-10">
      <ControlButton onClick={onVehicle} label="Vehicle">
        <Car size={20} />
      </ControlButton>
      <ControlButton onClick={onLocate} label="Current location">
        <LocateFixed size={20} />
      </ControlButton>
      <ControlButton onClick={onLegend} label="Map legend">
        <List size={20} />
      </ControlButton>
      <ControlButton onClick={onRefresh} label="Refresh">
        <RefreshCw size={20} />
      </ControlButton>
    </div>
  );
}
