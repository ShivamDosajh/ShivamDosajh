import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Flag, ArrowUpDown, X, GripVertical, UtensilsCrossed, Zap, ChevronRight, Star, Plus } from "lucide-react";
import { resolveStopPoint } from "../../data/routeStops";
import { getRestaurantById, getChargerForRestaurant } from "../../data/restaurants";
import { StopPickerModal } from "./StopPickerModal";

interface TripStopsListProps {
  startLabel: string;
  destinationLabel: string;
  onStartClick: () => void;
  onDestinationClick: () => void;
  onSwap: () => void;
  waypointRefs: string[];
  onAdd: (ref: string) => void;
  onRemove: (ref: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  excludeRefs: string[];
}

interface SlotRect {
  top: number;
  height: number;
}

/**
 * One continuous list — start, then every mid-trip stop, then destination — connected by a
 * single timeline, the way Google Maps lays out directions rather than a separate "stops"
 * section bolted on below the destination field.
 *
 * Drag-to-reorder only applies to the middle stop rows. To avoid a feedback loop where the
 * live-reordered array shifts the DOM mid-gesture (which made earlier reordering flaky —
 * each touchmove was measuring positions that had just changed from the *previous* move's
 * reorder call, so the two fought each other), this captures every stop row's rect ONCE at
 * drag start and computes the target index against that frozen layout for the whole
 * gesture. The underlying array is only reordered once, on release. Non-dragged rows get a
 * live translateY "make room" shift computed from that same frozen layout, so the list still
 * visually reorders in real time even though the data doesn't move until drop.
 */
export function TripStopsList({
  startLabel,
  destinationLabel,
  onStartClick,
  onDestinationClick,
  onSwap,
  waypointRefs,
  onAdd,
  onRemove,
  onReorder,
  excludeRefs,
}: TripStopsListProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [dragY, setDragY] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const layout = useRef<SlotRect[]>([]);
  const dragStartClientY = useRef(0);
  const dragStartTop = useRef(0);
  const overIndexRef = useRef<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const startDrag = useCallback((index: number, clientY: number) => {
    layout.current = itemRefs.current.map((el) => {
      if (!el) return { top: 0, height: 0 };
      const rect = el.getBoundingClientRect();
      return { top: rect.top, height: rect.height };
    });
    dragStartClientY.current = clientY;
    dragStartTop.current = layout.current[index]?.top ?? 0;
    dragIndexRef.current = index;
    overIndexRef.current = index;
    setDragIndex(index);
    setOverIndex(index);
    setDragY(0);
  }, []);

  const updateDrag = useCallback((clientY: number) => {
    const dIdx = dragIndexRef.current;
    if (dIdx === null) return;
    const dy = clientY - dragStartClientY.current;
    setDragY(dy);

    const draggedHeight = layout.current[dIdx]?.height ?? 0;
    const draggedCenter = dragStartTop.current + dy + draggedHeight / 2;

    let best = dIdx;
    let bestDist = Infinity;
    layout.current.forEach((slot, i) => {
      const mid = slot.top + slot.height / 2;
      const dist = Math.abs(draggedCenter - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });

    if (best !== overIndexRef.current) {
      overIndexRef.current = best;
      setOverIndex(best);
    }
  }, []);

  const endDrag = useCallback(() => {
    const dIdx = dragIndexRef.current;
    const oIdx = overIndexRef.current;
    if (dIdx !== null && oIdx !== null && dIdx !== oIdx) {
      onReorder(dIdx, oIdx);
    }
    dragIndexRef.current = null;
    overIndexRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
    setDragY(0);
  }, [onReorder]);

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
      if (t) updateDrag(t.clientY);
    };
    const handleEnd = () => endDrag();
    const handleMouseMove = (e: MouseEvent) => updateDrag(e.clientY);

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
    window.addEventListener("touchcancel", handleEnd);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleEnd);
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
    };
  }, [dragIndex, updateDrag, endDrag]);

  const draggedHeight = dragIndex !== null ? layout.current[dragIndex]?.height ?? 0 : 0;

  return (
    <div ref={containerRef} className="relative rounded-card bg-surfaceRaised border border-border overflow-hidden">
      <button
        onClick={onSwap}
        aria-label="Swap start and destination"
        className="absolute right-3 top-3 z-30 w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center active:opacity-70"
      >
        <ArrowUpDown size={15} className="text-primary" />
      </button>

      {/* connecting timeline line, behind the dots */}
      <div className="absolute left-[27px] top-[26px] bottom-[26px] w-px bg-border" />

      <div className="relative flex flex-col">
        <button onClick={onStartClick} className="flex items-center gap-3 px-3.5 py-3 min-h-[44px] text-left pr-14">
          <div className="w-8 h-8 rounded-full bg-background border-2 border-black flex items-center justify-center shrink-0 relative z-10">
            <div className="w-2.5 h-2.5 rounded-full bg-black" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-secondaryText lowercase">from</p>
            <p className="text-[15px] text-text font-medium truncate">{startLabel}</p>
          </div>
          <ChevronRight size={16} className="text-secondaryText shrink-0" />
        </button>

        {waypointRefs.map((ref, index) => {
          const stop = resolveStopPoint(ref);
          if (!stop) return null;
          const restaurant = stop.kind === "restaurant" ? getRestaurantById(ref.slice("food:".length)) : undefined;
          const charger = restaurant ? getChargerForRestaurant(restaurant) : undefined;
          const dragging = dragIndex === index;

          let translateY = 0;
          if (!dragging && dragIndex !== null && overIndex !== null) {
            if (dragIndex < overIndex && index > dragIndex && index <= overIndex) {
              translateY = -draggedHeight;
            } else if (dragIndex > overIndex && index >= overIndex && index < dragIndex) {
              translateY = draggedHeight;
            }
          }

          return (
            <div
              key={ref}
              ref={(el) => (itemRefs.current[index] = el)}
              style={{
                transform: dragging ? `translateY(${dragY}px)` : translateY ? `translateY(${translateY}px)` : undefined,
                transition: dragging ? "none" : "transform 0.15s ease",
              }}
              className={[
                "relative flex items-center gap-2 pl-2 pr-3.5 py-2 select-none bg-surfaceRaised",
                dragging ? "z-20 shadow-lg rounded-card" : "z-10",
              ].join(" ")}
            >
              <button
                data-grip-index={index}
                onPointerDown={(e) => {
                  if (e.pointerType === "touch") return;
                  startDrag(index, e.clientY);
                }}
                aria-label={`Reorder ${stop.label}`}
                className="w-6 h-6 flex items-center justify-center text-secondaryText shrink-0 touch-none cursor-grab active:cursor-grabbing"
              >
                <GripVertical size={14} />
              </button>

              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 relative z-10">
                {stop.kind === "restaurant" ? <UtensilsCrossed size={14} /> : <MapPin size={14} />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-text truncate">{stop.label}</p>
                {restaurant ? (
                  <p className="text-[11px] text-secondaryText truncate flex items-center gap-1.5">
                    {restaurant.cuisine}
                    <span className="flex items-center gap-0.5 text-warning shrink-0">
                      <Star size={9} className="fill-warning" />
                      {restaurant.rating.toFixed(1)}
                    </span>
                    {charger && (
                      <span className="flex items-center gap-0.5 text-primary shrink-0">
                        <Zap size={9} />
                        {charger.powerKw}kW
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-[11px] text-secondaryText truncate">{stop.subtitle}</p>
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
          className="flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] text-left text-primary"
        >
          <div className="w-8 h-8 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center shrink-0 relative z-10">
            <Plus size={14} />
          </div>
          <span className="text-[13px] font-medium">add a stop</span>
        </button>

        <button onClick={onDestinationClick} className="flex items-center gap-3 px-3.5 py-3 min-h-[44px] text-left">
          <div className="w-8 h-8 rounded-full bg-error border-2 border-white flex items-center justify-center shrink-0 relative z-10 shadow">
            <Flag size={13} className="text-white" fill="white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-secondaryText lowercase">to</p>
            <p className="text-[15px] text-text font-medium truncate">{destinationLabel}</p>
          </div>
          <ChevronRight size={16} className="text-secondaryText shrink-0" />
        </button>
      </div>

      <StopPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onAdd}
        excludeRefs={[...excludeRefs, ...waypointRefs]}
      />
    </div>
  );
}
