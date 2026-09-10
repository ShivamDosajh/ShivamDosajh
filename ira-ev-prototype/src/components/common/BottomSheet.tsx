import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

interface DragHandleProps {
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLDivElement>) => void;
}

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Explicit sheet height in px — pair with a drag hook (see useSheetDrag) for gesture-driven sheets. */
  heightPx: number;
  /** Disables the settle transition while the user is actively dragging, for 1:1 tracking. */
  isDragging?: boolean;
  dragHandleProps?: DragHandleProps;
}

/**
 * Mobile browsers fire a delayed synthetic "click" after a touchend, for compatibility
 * with mouse-only pages. The tap that opens this sheet is handled entirely through
 * Pointer Events (see MockMap), but that trailing ghost click still lands moments later
 * — right on this freshly-mounted backdrop, closing the sheet immediately after it opened.
 * Ignoring backdrop clicks in the first instant after mount absorbs that ghost click
 * without adding any perceptible delay to a real, intentional tap-to-dismiss.
 */
const BACKDROP_GUARD_MS = 400;

export function BottomSheet({
  open,
  onClose,
  children,
  footer,
  heightPx,
  isDragging = false,
  dragHandleProps,
}: BottomSheetProps) {
  const mountedAt = useRef(Date.now());

  if (!open) return null;

  const handleBackdropClick = () => {
    if (Date.now() - mountedAt.current < BACKDROP_GUARD_MS) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <button
        aria-label="Close"
        onClick={handleBackdropClick}
        className="absolute inset-0 bg-black/60 animate-fade-in"
      />
      <div
        className="relative bg-surface rounded-t-[24px] border-t border-border flex flex-col animate-sheet-up overflow-hidden"
        style={{
          height: heightPx,
          transition: isDragging ? "none" : "height 0.28s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div
          className="flex justify-center pt-2.5 pb-2 shrink-0 touch-none cursor-grab active:cursor-grabbing"
          {...dragHandleProps}
        >
          <div className="w-10 h-1 rounded-pill bg-border" />
        </div>
        <div className="overflow-y-auto no-scrollbar px-4 pb-2 grow">{children}</div>
        {footer && (
          <div className="shrink-0 px-4 pt-3 pb-4 safe-bottom border-t border-border bg-surface">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
