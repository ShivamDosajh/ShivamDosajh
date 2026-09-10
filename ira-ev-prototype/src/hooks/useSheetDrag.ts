import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

interface UseSheetDragOptions {
  /** Sheet height as a percentage of viewport height when collapsed. */
  collapsedVh: number;
  /** Sheet height as a percentage of viewport height when expanded. */
  expandedVh: number;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

interface UseSheetDragResult {
  /** Current sheet height in px — follows the finger 1:1 while dragging, animates otherwise. */
  heightPx: number;
  isDragging: boolean;
  /** Live expand/collapse state, already flipped mid-drag once the sheet crosses the midpoint. */
  visualExpanded: boolean;
  handleProps: {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: ReactPointerEvent<HTMLDivElement>) => void;
  };
}

const TAP_THRESHOLD_PX = 6;
const OVERDRAG_RESISTANCE = 0.35;

export function useSheetDrag({
  collapsedVh,
  expandedVh,
  expanded,
  onExpandedChange,
}: UseSheetDragOptions): UseSheetDragResult {
  const [dragHeightPx, setDragHeightPx] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startHeightPx = useRef(0);
  const movedPastTapThreshold = useRef(false);
  /** Only true between a real pointerdown and its matching up/cancel — guards against
   * stray pointermove events (e.g. hover-before-press with no button held) touching
   * refs that haven't been initialized for this gesture yet. */
  const gestureActive = useRef(false);
  const activePointerId = useRef<number | null>(null);

  const vh = useCallback((v: number) => (v / 100) * window.innerHeight, []);
  const collapsedPx = vh(collapsedVh);
  const expandedPx = vh(expandedVh);
  const targetPx = expanded ? expandedPx : collapsedPx;

  const clamp = useCallback(
    (px: number) => {
      if (px > expandedPx) return expandedPx + (px - expandedPx) * OVERDRAG_RESISTANCE;
      if (px < collapsedPx) return collapsedPx - (collapsedPx - px) * OVERDRAG_RESISTANCE;
      return px;
    },
    [collapsedPx, expandedPx]
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      gestureActive.current = true;
      activePointerId.current = e.pointerId;
      startY.current = e.clientY;
      startHeightPx.current = dragHeightPx ?? targetPx;
      movedPastTapThreshold.current = false;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore capture failures
      }
    },
    [dragHeightPx, targetPx]
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      // Pointer capture isn't set until a real press happens, so a plain hover can
      // still deliver a pointermove here — ignore anything outside an active gesture.
      if (!gestureActive.current || e.pointerId !== activePointerId.current) return;
      const dy = e.clientY - startY.current;
      if (!movedPastTapThreshold.current) {
        if (Math.abs(dy) < TAP_THRESHOLD_PX) return;
        movedPastTapThreshold.current = true;
        setIsDragging(true);
      }
      const next = startHeightPx.current - dy; // dragging up (negative dy) grows the sheet
      setDragHeightPx(clamp(next));
    },
    [clamp]
  );

  const settle = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!gestureActive.current || e.pointerId !== activePointerId.current) return;
      gestureActive.current = false;
      activePointerId.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      if (!movedPastTapThreshold.current) {
        // A plain tap on the handle — toggle instantly.
        onExpandedChange(!expanded);
        setDragHeightPx(null);
        return;
      }

      setIsDragging(false);
      const current = dragHeightPx ?? targetPx;
      const midpoint = (collapsedPx + expandedPx) / 2;
      onExpandedChange(current > midpoint);
      setDragHeightPx(null);
    },
    [dragHeightPx, targetPx, collapsedPx, expandedPx, expanded, onExpandedChange]
  );

  const heightPx = dragHeightPx ?? targetPx;
  const midpoint = (collapsedPx + expandedPx) / 2;
  const visualExpanded = heightPx > midpoint;

  return {
    heightPx,
    isDragging,
    visualExpanded,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: settle,
      onPointerCancel: settle,
    },
  };
}
