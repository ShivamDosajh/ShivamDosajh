import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Navigation } from "lucide-react";
import type { Station } from "../../types/charging";
import { MockMapBackground } from "./MockMapBackground";
import { StationMarker } from "./StationMarker";

interface MockMapProps {
  stations: Station[];
  selectedStationId: string | null;
  onSelectStation: (id: string) => void;
  vehiclePosition?: { x: number; y: number };
}

const MIN_SCALE = 0.8;
const MAX_SCALE = 2.2;

export function MockMap({
  stations,
  selectedStationId,
  onSelectStation,
  vehiclePosition = { x: 40, y: 58 },
}: MockMapProps) {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(
    null
  );

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: transform.x,
      originY: transform.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setTransform((prev) => ({ ...prev, x: dragState.current!.originX + dx, y: dragState.current!.originY + dy }));
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  const zoomIn = () => setTransform((p) => ({ ...p, scale: Math.min(MAX_SCALE, p.scale + 0.2) }));
  const zoomOut = () => setTransform((p) => ({ ...p, scale: Math.max(MIN_SCALE, p.scale - 0.2) }));

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[#dff0e4] touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div
        className="absolute inset-0 origin-center"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transition: dragState.current ? "none" : "transform 0.15s ease-out",
        }}
      >
        <MockMapBackground />

        {stations.map((station) => (
          <StationMarker
            key={station.id}
            station={station}
            selected={station.id === selectedStationId}
            onClick={() => onSelectStation(station.id)}
          />
        ))}

        <div
          style={{ left: `${vehiclePosition.x}%`, top: `${vehiclePosition.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
        >
          <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center shadow-lg border-2 border-white">
            <Navigation size={16} className="text-white" fill="white" />
          </div>
        </div>
      </div>

      <div className="absolute left-4 bottom-6 flex flex-col rounded-full overflow-hidden shadow-lg z-10">
        <button
          onClick={zoomIn}
          aria-label="Zoom in"
          className="w-11 h-11 bg-black/85 text-white text-lg flex items-center justify-center border-b border-white/10 active:opacity-70"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          aria-label="Zoom out"
          className="w-11 h-11 bg-black/85 text-white text-lg flex items-center justify-center active:opacity-70"
        >
          −
        </button>
      </div>
    </div>
  );
}
