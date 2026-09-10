import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, X, GripVertical, MapPin, Zap, UtensilsCrossed, Wifi, Bath } from "lucide-react";
import { resolveStopPoint } from "../../data/routeStops";
import { getChargerById } from "../../data/routeChargers";
import { StopPickerModal } from "./StopPickerModal";
import type { Amenity } from "../../types/route";

interface WaypointListProps {
  waypointRefs: string[];
  onAdd: (ref: string) => void;
  onRemove: (ref: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  excludeRefs: string[];
}

const AMENITY_ICON: Record<Amenity, typeof UtensilsCrossed> = {
  food: UtensilsCrossed,
  restroom: Bath,
  wifi: Wifi,
};

/**
 * Drag-to-reorder list of mid-trip stops (Google Maps style). Touch drag is handled via a
 * single non-passive native `touchstart` listener on the container that reads the dragged
 * handle's index off a `data-grip-index` attribute at event time — a JSX `onTouchStart`
 * can't reliably register non-passive on iOS (same issue fixed on the map), and reading the
 * index from the DOM instead of a closure avoids stale indices as items reorder mid-drag.
 */
export function WaypointList({ waypointRefs, onAdd, onRemove, onReorder, excludeRefs }: WaypointListProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragY, setDragY] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragRef = useRef<{ index: number; startClientY: number } | null>(null);

  const updateDragPosition = useCallback((clientY: number) => {
    const d = dragRef.current;
    if (!d) return;
    setDragY(clientY - d.startClientY);

    let newIndex = d.index;
    let bestDist = Infinity;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const dist = Math.abs(clientY - mid);
      if (dist < bestDist) {
        bestDist = dist;
        newIndex = i;
      }
    });
    if (newIndex !== d.index) {
      onReorder(d.index, newIndex);
      d.index = newIndex;
    }
  }, [onReorder]);

  const endDrag = useCallback(() => {
    dragRef.current = null;
    setDragIndex(null);
    setDragY(0);
  }, []);

  const startDrag = useCallback((index: number, clientY: number) => {
    dragRef.current = { index, startClientY: clientY };
    setDragIndex(index);
    setDragY(0);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onTouchStart = (e: TouchEvent) => {
      const handle = (e.target as HTMLElement).closest("[data-grip-index]") as HTMLElement | null;
      if (!handle) return;
      e.preventDefault();
      const index = Number(handle.dataset.gripIndex);
      const t = e.touches[0];
      if (t) startDrag(index, t.clientY);
    };
    container.addEventListener("touchstart", onTouchStart, { passive: false });
    return () => container.removeEventListener("touchstart", onTouchStart);
  }, [startDrag]);

  useEffect(() => {
    if (dragIndex === null) return;
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      if (t) updateDragPosition(t.clientY);
    };
    const handleTouchEnd = () => endDrag();
    const handleMouseMove = (e: MouseEvent) => updateDragPosition(e.clientY);
    const handleMouseUp = () => endDrag();

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragIndex, updateDragPosition, endDrag]);

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      {waypointRefs.map((ref, index) => {
        const stop = resolveStopPoint(ref);
        if (!stop) return null;
        const charger = stop.kind === "charger-amenity" ? getChargerById(ref.slice("charger:".length)) : undefined;
        const dragging = dragIndex === index;

        return (
          <div
            key={ref}
            ref={(el) => (itemRefs.current[index] = el)}
            style={dragging ? { transform: `translateY(${dragY}px)` } : undefined}
            className={[
              "relative flex items-center gap-2 rounded-card bg-surfaceRaised border px-2.5 py-2.5 select-none",
              dragging ? "border-primary shadow-lg z-20" : "border-border z-0",
            ].join(" ")}
          >
            <button
              data-grip-index={index}
              onPointerDown={(e) => {
                if (e.pointerType === "touch") return;
                startDrag(index, e.clientY);
              }}
              aria-label={`Reorder ${stop.label}`}
              className="w-8 h-8 flex items-center justify-center text-secondaryText shrink-0 touch-none cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={15} />
            </button>

            <div
              className={[
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                stop.kind === "charger-amenity" ? "bg-primary/15 text-primary" : "bg-background text-warning",
              ].join(" ")}
            >
              {stop.kind === "charger-amenity" ? <Zap size={14} /> : <MapPin size={14} />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-text truncate">{stop.label}</p>
              {charger && charger.amenities.length > 0 && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  {charger.amenities.map((a) => {
                    const Icon = AMENITY_ICON[a];
                    return <Icon key={a} size={11} className="text-secondaryText" />;
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => onRemove(ref)}
              aria-label={`Remove ${stop.label}`}
              className="w-8 h-8 flex items-center justify-center rounded-full text-secondaryText active:bg-background shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}

      <button
        onClick={() => setPickerOpen(true)}
        className="flex items-center gap-2 text-primary text-[14px] font-medium py-2 min-h-[44px]"
      >
        <Plus size={16} />
        add stop
      </button>

      <StopPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onAdd}
        excludeRefs={[...excludeRefs, ...waypointRefs]}
      />
    </div>
  );
}
