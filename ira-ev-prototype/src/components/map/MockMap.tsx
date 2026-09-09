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
/** Below this movement, a single-finger touch is still a tap — don't steal it from marker buttons. */
const PAN_ACTIVATION_PX = 8;

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

interface PointerInfo {
  x: number;
  y: number;
}

interface PanGesture {
  kind: "pan" | "pan-pending";
  pointerId: number;
  startClientX: number;
  startClientY: number;
  originX: number;
  originY: number;
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

  const pointers = useRef<Map<number, PointerInfo>>(new Map());
  const gesture = useRef<PanGesture | PinchGesture | null>(null);

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

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 1) {
      // Don't capture yet — a lone finger might just be tapping a marker button.
      // Capture only kicks in once handlePointerMove sees real drag movement.
      gesture.current = {
        kind: "pan-pending",
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        originX: transform.x,
        originY: transform.y,
      };
    } else if (pointers.current.size === 2) {
      // A second finger arriving is unambiguously a pinch gesture, never a tap.
      setIsGesturing(true);
      try {
        pointers.current.forEach((_info, id) => (e.currentTarget as HTMLElement).setPointerCapture(id));
      } catch {
        // ignore capture failures
      }
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
      const anchorX = cx + (relX - cx - transform.x) / transform.scale;
      const anchorY = cy + (relY - cy - transform.y) / transform.scale;
      gesture.current = {
        kind: "pinch",
        startDistance: distance || 1,
        startScale: transform.scale,
        anchor: { x: anchorX, y: anchorY },
      };
    }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const g = gesture.current;
    if (!g) return;

    try {
      if (g.kind === "pan-pending" && pointers.current.size === 1) {
        const dx = e.clientX - g.startClientX;
        const dy = e.clientY - g.startClientY;
        if (Math.hypot(dx, dy) > PAN_ACTIVATION_PX) {
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(g.pointerId);
          } catch {
            // ignore capture failures
          }
          setIsGesturing(true);
          gesture.current = { ...g, kind: "pan" };
          setTransform((prev) => ({ ...prev, x: g.originX + dx, y: g.originY + dy }));
        }
      } else if (g.kind === "pan" && pointers.current.size === 1) {
        const dx = e.clientX - g.startClientX;
        const dy = e.clientY - g.startClientY;
        setTransform((prev) => ({ ...prev, x: g.originX + dx, y: g.originY + dy }));
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
        setTransform({
          scale: nextScale,
          x: relX - cx - nextScale * (g.anchor.x - cx),
          y: relY - cy - nextScale * (g.anchor.y - cy),
        });
      }
    } catch {
      // never let a gesture-math edge case take the whole map down
    }
  };

  const endPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (pointers.current.size === 0) {
      gesture.current = null;
      setIsGesturing(false);
    } else if (pointers.current.size === 1) {
      const [[pointerId, info]] = pointers.current;
      gesture.current = {
        kind: "pan",
        pointerId,
        startClientX: info.x,
        startClientY: info.y,
        originX: transform.x,
        originY: transform.y,
      };
    }
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

  const handleClusterClick = (centroid: { x: number; y: number }) => {
    if (!containerSize.width || !containerSize.height) return;
    const nextScale = clampScale(transform.scale * CLUSTER_ZOOM_STEP);
    const pan = panToCenter(centroid, containerSize, nextScale);
    setTransform({ scale: nextScale, x: pan.x, y: pan.y });
  };

  const clusters =
    enableClustering && containerSize.width > 0
      ? clusterStations(stations, containerSize, transform)
      : stations.map((s) => ({ id: s.id, stations: [s], centroid: s.coordinates }));

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#dff0e4] touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerLeave={endPointer}
      onWheel={handleWheel}
    >
      <div
        className="absolute inset-0 origin-center"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transition: isGesturing ? "none" : "transform 0.15s ease-out",
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
