import { Zap, ZapOff } from "lucide-react";
import type { Station } from "../../types/charging";

interface StationMarkerProps {
  station: Station;
  selected: boolean;
  onClick: () => void;
}

export function StationMarker({ station, selected, onClick }: StationMarkerProps) {
  const baseColor = !station.available
    ? "bg-secondaryText"
    : station.isMegaCharger
    ? "bg-orange-400"
    : "bg-primary";

  return (
    <button
      onClick={onClick}
      aria-label={station.name}
      style={{ left: `${station.coordinates.x}%`, top: `${station.coordinates.y}%` }}
      className={[
        "absolute -translate-x-1/2 -translate-y-full flex flex-col items-center",
        "min-w-[44px] min-h-[44px] justify-end",
        selected ? "z-20" : "z-10",
      ].join(" ")}
    >
      <div
        className={[
          "w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2",
          baseColor,
          selected ? "border-white scale-125" : "border-white/70",
          "transition-transform",
        ].join(" ")}
      >
        {station.available ? (
          <Zap size={16} className="text-black" fill="black" />
        ) : (
          <ZapOff size={16} className="text-black" />
        )}
      </div>
      <div
        className={[
          "w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] -mt-0.5",
          selected ? "border-t-white" : "border-t-white/70",
        ].join(" ")}
      />
    </button>
  );
}
