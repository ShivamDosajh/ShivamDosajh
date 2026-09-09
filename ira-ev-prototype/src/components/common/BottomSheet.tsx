import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxHeight?: string;
  /** Called once per decisive tap or drag on the handle — the consumer decides what "toggle" means. */
  onHandleToggle?: () => void;
}

const DRAG_THRESHOLD_PX = 32;

export function BottomSheet({
  open,
  onClose,
  children,
  footer,
  maxHeight = "78dvh",
  onHandleToggle,
}: BottomSheetProps) {
  const dragStartY = useRef<number | null>(null);
  const dragFired = useRef(false);

  if (!open) return null;

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragStartY.current = e.clientY;
    dragFired.current = false;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore capture failures
    }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartY.current === null || dragFired.current || !onHandleToggle) return;
    const delta = Math.abs(e.clientY - dragStartY.current);
    if (delta > DRAG_THRESHOLD_PX) {
      dragFired.current = true;
      onHandleToggle();
    }
  };

  const handlePointerUp = () => {
    dragStartY.current = null;
  };

  const handleClick = () => {
    if (dragFired.current) {
      dragFired.current = false;
      return;
    }
    onHandleToggle?.();
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 animate-fade-in"
      />
      <div
        className="relative bg-surface rounded-t-[24px] border-t border-border flex flex-col animate-sheet-up transition-[max-height] duration-200 ease-out"
        style={{ maxHeight }}
      >
        <div
          className="flex justify-center pt-2.5 pb-2 shrink-0 touch-none cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleClick}
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
