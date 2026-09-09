import { ArrowLeft, Headphones } from "lucide-react";
import { useRef } from "react";
import { useExperiments } from "../../hooks/useExperiments";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  showSupport?: boolean;
}

const LONG_PRESS_MS = 700;

export function ScreenHeader({ title, onBack, showSupport = true }: ScreenHeaderProps) {
  const { openPanel } = useExperiments();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startPress = () => {
    timerRef.current = setTimeout(() => {
      openPanel();
    }, LONG_PRESS_MS);
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <header
      className="safe-top bg-background shrink-0"
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
    >
      <div className="h-14 flex items-center px-2 relative">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="w-11 h-11 flex items-center justify-center rounded-full active:bg-surfaceRaised"
          >
            <ArrowLeft size={22} />
          </button>
        ) : (
          <div className="w-11 h-11" />
        )}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[17px] font-medium lowercase select-none">
          {title}
        </h1>
        {showSupport ? (
          <button
            aria-label="Support"
            className="ml-auto w-11 h-11 flex items-center justify-center rounded-full bg-primary/15 text-primary active:opacity-70"
          >
            <Headphones size={18} />
          </button>
        ) : (
          <div className="ml-auto w-11 h-11" />
        )}
      </div>
    </header>
  );
}
