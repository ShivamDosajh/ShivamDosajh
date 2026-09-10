import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { Navigation } from "lucide-react";
import type { Station } from "../../types/charging";
import { MockMapBackground } from "./MockMapBackground";
import { StationMarker } from "./StationMarker";
import { ClusterMarker } from "./ClusterMarker";
import { clusterStations, panToCenter, type MapTransform } from "./clustering";

interface MockMapProps {
  stations: Station[];
  selectedStationId: string | null;
  onSelectStation: (id: string) => void;
  vehiclePosition?: { x: number; y: number };
  enableClustering?: boolean;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 5;
const CLUSTER_ZOOM_STEP = 1.9;
/** Net movement below this, over the whole gesture, still counts as a tap on whatever was underneath. */
const CLICK_SUPPRESS_PX = 8;

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

interface PointerInfo {
  x: number;
  y: number;
}

interface PanGesture {
  kind: "pan";
  originX: number;
  originY: number;
  startClientX: number;
  startClientY: number;
}

interface PinchGesture {
  kind: "pinch";
  startDistance: number;
  startScale: number;
  /** map-space point (pre-transform pixels) under the gesture midpoint at gesture start */
  anchor: { x: number; y: number };
}

export function MockMap({
  stations,
  selectedStationId,
  onSelectStation,
  vehiclePosition = { x: 40, y: 58 },
  enableClustering = true,
}: MockMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [transform, setTransform] = useState<MapTransform>({ scale: 1, x: 0, y: 0 });
  const [isGesturing, setIsGesturing] = useState(false);

  // Kept in a ref (in addition to state) so the imperative touch-event core below
  // always reads the live value without needing to re-attach listeners every frame.
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const pointers = useRef<Map<number, PointerInfo>>(new Map());
  const gesture = useRef<PanGesture | PinchGesture | null>(null);
  const totalMovement = useRef(0);

  // rAF-coalesced transform updates: move events can fire faster than the display
  // refreshes, so we stash the latest computed transform in a ref and flush at most
  // once per frame instead of triggering a React re-render on every raw event.
  const pendingTransform = useRef<MapTransform | null>(null);
  const rafId = useRef<number | null>(null);

  const flushTransform = useCallback(() => {
    rafId.current = null;
    if (pendingTransform.current) {
      setTransform(pendingTransform.current);
      pendingTransform.current = null;
    }
  }, []);

  const queueTransform = useCallback(
    (next: MapTransform) => {
      pendingTransform.current = next;
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(flushTransform);
      }
    },
    [flushTransform]
  );

  useEffect(() => {
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const zoomAtPoint = useCallback((px: number, py: number, nextScaleRaw: number) => {
    setTransform((prev) => {
      const nextScale = clampScale(nextScaleRaw);
      const size = containerRef.current?.getBoundingClientRect();
      if (!size) return prev;
      const cx = size.width / 2;
      const cy = size.height / 2;
      const preX = cx + (px - cx - prev.x) / prev.scale;
      const preY = cy + (py - cy - prev.y) / prev.scale;
      return {
        scale: nextScale,
        x: px - cx - nextScale * (preX - cx),
        y: py - cy - nextScale * (preY - cy),
      };
    });
  }, []);

  const handleClusterClick = useCallback((centroid: { x: number; y: number }) => {
    setTransform((prev) => {
      const size = containerRef.current?.getBoundingClientRect();
      if (!size) return prev;
      const nextScale = clampScale(prev.scale * CLUSTER_ZOOM_STEP);
      const pan = panToCenter(centroid, { width: size.width, height: size.height }, nextScale);
      return { scale: nextScale, x: pan.x, y: pan.y };
    });
  }, []);

  // ---- Shared gesture core, keyed by an input-agnostic id (PointerEvent.pointerId
  // for mouse/pen, Touch.identifier for touch). Reads/writes only refs so it works
  // identically from either the Pointer Events path (mouse) or the native Touch
  // Events path (see the useEffect below) without needing to re-close over state. ----

  const beginGesture = useCallback((id: number, x: number, y: number) => {
    pointers.current.set(id, { x, y });
    const t = transformRef.current;

    if (pointers.current.size === 1) {
      totalMovement.current = 0;
      setIsGesturing(true);
      gesture.current = { kind: "pan", originX: t.x, originY: t.y, startClientX: x, startClientY: y };
    } else if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const distance = Math.hypot(dx, dy);
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      const rect = containerRef.current?.getBoundingClientRect();
      const cx = rect ? rect.width / 2 : 0;
      const cy = rect ? rect.height / 2 : 0;
      const relX = midX - (rect?.left ?? 0);
      const relY = midY - (rect?.top ?? 0);
      const anchorX = cx + (relX - cx - t.x) / t.scale;
      const anchorY = cy + (relY - cy - t.y) / t.scale;
      gesture.current = {
        kind: "pinch",
        startDistance: distance || 1,
        startScale: t.scale,
        anchor: { x: anchorX, y: anchorY },
      };
    }
  }, []);

  const updateGesture = useCallback(
    (id: number, x: number, y: number) => {
      if (!pointers.current.has(id)) return;
      const prevInfo = pointers.current.get(id)!;
      pointers.current.set(id, { x, y });
      totalMovement.current += Math.hypot(x - prevInfo.x, y - prevInfo.y);

      const g = gesture.current;
      if (!g) return;

      try {
        if (g.kind === "pan" && pointers.current.size === 1) {
          const dx = x - g.startClientX;
          const dy = y - g.startClientY;
          queueTransform({ ...transformRef.current, x: g.originX + dx, y: g.originY + dy });
        } else if (g.kind === "pinch" && pointers.current.size === 2) {
          const pts = [...pointers.current.values()];
          const dx = pts[0].x - pts[1].x;
          const dy = pts[0].y - pts[1].y;
          const distance = Math.hypot(dx, dy) || 1;
          const midX = (pts[0].x + pts[1].x) / 2;
          const midY = (pts[0].y + pts[1].y) / 2;
          const rect = containerRef.current?.getBoundingClientRect();
          const cx = rect ? rect.width / 2 : 0;
          const cy = rect ? rect.height / 2 : 0;
          const relX = midX - (rect?.left ?? 0);
          const relY = midY - (rect?.top ?? 0);
          const nextScale = clampScale(g.startScale * (distance / g.startDistance));
          queueTransform({
            scale: nextScale,
            x: relX - cx - nextScale * (g.anchor.x - cx),
            y: relY - cy - nextScale * (g.anchor.y - cy),
          });
        }
      } catch {
        // never let a gesture-math edge case take the whole map down
      }
    },
    [queueTransform]
  );

  const endGesture = useCallback(
    (id: number, x: number, y: number) => {
      // A single lift-off can deliver more than one "end" style event for the same id
      // (observed pointerup+pointercancel pairs on touch) — .has() before the delete
      // makes every call after the first a no-op instead of re-dispatching a tap
      // against a DOM that's already changed (e.g. onto a sheet's own backdrop).
      const wasTracked = pointers.current.has(id);
      pointers.current.delete(id);
      if (!wasTracked) return;

      if (pointers.current.size === 0) {
        // Flush any rAF-pending transform immediately so the map doesn't lag one frame behind the finger.
        if (rafId.current !== null) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
        if (pendingTransform.current) {
          setTransform(pendingTransform.current);
          pendingTransform.current = null;
        }

        // Neither capture-retargeted pointer clicks nor native touch's own click are
        // reliable here, so dispatch taps ourselves. A "tap" is any gesture that barely moved.
        if (totalMovement.current <= CLICK_SUPPRESS_PX) {
          const target = document.elementFromPoint(x, y) as HTMLElement | null;
          const markerEl = target?.closest<HTMLElement>("[data-marker-id]");
          const clusterEl = target?.closest<HTMLElement>("[data-cluster-marker]");
          if (markerEl?.dataset.markerId) {
            onSelectStation(markerEl.dataset.markerId);
          } else if (clusterEl) {
            const cx = parseFloat(clusterEl.dataset.clusterX ?? "");
            const cy = parseFloat(clusterEl.dataset.clusterY ?? "");
            if (!Number.isNaN(cx) && !Number.isNaN(cy)) handleClusterClick({ x: cx, y: cy });
          }
        }

        gesture.current = null;
        setIsGesturing(false);
      } else if (pointers.current.size === 1) {
        const [[, info]] = pointers.current;
        gesture.current = {
          kind: "pan",
          originX: transformRef.current.x,
          originY: transformRef.current.y,
          startClientX: info.x,
          startClientY: info.y,
        };
      }
    },
    [onSelectStation, handleClusterClick]
  );

  // ---- Touch path: native TouchEvents, not Pointer Events. iOS Safari's Pointer
  // Events + setPointerCapture support has real reliability gaps (capture not always
  // honored, coalesced multi-touch quirks); raw touch events are the long-established
  // reliable primitive there. Registered manually with {passive:false} so
  // preventDefault can actually stop the page's own scroll/pinch-zoom and the
  // trailing synthetic mouse/click events — React's JSX onTouchStart cannot guarantee
  // non-passive registration. Attached once (empty deps); all state is read via refs. ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      for (const t of Array.from(e.changedTouches)) {
        beginGesture(t.identifier, t.clientX, t.clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      for (const t of Array.from(e.changedTouches)) {
        updateGesture(t.identifier, t.clientX, t.clientY);
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      for (const t of Array.from(e.changedTouches)) {
        endGesture(t.identifier, t.clientX, t.clientY);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: false });
    el.addEventListener("touchcancel", onTouchEnd, { passive: false });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [beginGesture, updateGesture, endGesture]);

  // ---- Mouse/pen path: Pointer Events (well-supported and already battle-tested
  // for non-touch input). Explicitly ignores pointerType "touch" so a touch gesture
  // is only ever handled once, by the native listeners above. ----

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore capture failures
    }
    beginGesture(e.pointerId, e.clientX, e.clientY);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    updateGesture(e.pointerId, e.clientX, e.clientY);
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    endGesture(e.pointerId, e.clientX, e.clientY);
  };

  const handleWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const factor = Math.exp(-e.deltaY * 0.0015);
    zoomAtPoint(px, py, transform.scale * factor);
  };

  const zoomIn = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    zoomAtPoint(rect ? rect.width / 2 : 0, rect ? rect.height / 2 : 0, transform.scale * 1.4);
  };
  const zoomOut = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    zoomAtPoint(rect ? rect.width / 2 : 0, rect ? rect.height / 2 : 0, transform.scale / 1.4);
  };

  const clusters =
    enableClustering && containerSize.width > 0
      ? clusterStations(stations, containerSize, transform)
      : stations.map((s) => ({ id: s.id, stations: [s], centroid: s.coordinates }));

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#dff0e4] touch-none select-none [overscroll-behavior:contain]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      <div
        className="absolute inset-0 origin-center [will-change:transform]"
        style={{
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
          transition: isGesturing ? "none" : "transform 0.2s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <MockMapBackground />

        {clusters.map((cluster) =>
          cluster.stations.length > 1 ? (
            <ClusterMarker
              key={cluster.id}
              count={cluster.stations.length}
              x={cluster.centroid.x}
              y={cluster.centroid.y}
              onClick={() => handleClusterClick(cluster.centroid)}
            />
          ) : (
            <StationMarker
              key={cluster.stations[0].id}
              station={cluster.stations[0]}
              selected={cluster.stations[0].id === selectedStationId}
              onClick={() => onSelectStation(cluster.stations[0].id)}
            />
          )
        )}

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
