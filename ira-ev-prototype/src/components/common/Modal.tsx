import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 animate-fade-in"
      />
      <div className="relative w-full sm:max-w-sm max-h-[80dvh] bg-surface rounded-t-sheet sm:rounded-card border border-border flex flex-col animate-sheet-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-[16px] font-semibold leading-6">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surfaceRaised active:opacity-70"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto no-scrollbar px-6 py-4 text-[14px] leading-6 text-secondaryText safe-bottom">
          {children}
        </div>
      </div>
    </div>
  );
}
