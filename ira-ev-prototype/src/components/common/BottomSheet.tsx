import type { ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxHeight?: string;
}

export function BottomSheet({ open, onClose, children, footer, maxHeight = "78dvh" }: BottomSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 animate-fade-in"
      />
      <div
        className="relative bg-surface rounded-t-[24px] border-t border-border flex flex-col animate-sheet-up"
        style={{ maxHeight }}
      >
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
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
