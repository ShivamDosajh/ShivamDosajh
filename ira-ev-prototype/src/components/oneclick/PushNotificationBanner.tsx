import { useEffect, useState } from "react";
import { Zap, X } from "lucide-react";
import { useOneClickCharging } from "../../hooks/useOneClickCharging";

interface PushNotificationBannerProps {
  /** Opens the quick-charge screen for the verified station+charger. */
  onOpen: (stationId: string, chargerId: string) => void;
}

function relativeTime(firedAt: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - firedAt) / 1000));
  if (seconds < 5) return "now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.round(seconds / 60)}m ago`;
}

/**
 * A simulated OS-style push notification banner for the one-click charging flow — sits above
 * the app UI like a native notification would, rather than a normal in-app toast, since the
 * whole point of the feature is "get notified without having to be looking at the app".
 */
export function PushNotificationBanner({ onOpen }: PushNotificationBannerProps) {
  const { notification, dismissNotification, clearSession } = useOneClickCharging();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!notification) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [notification?.firedAt]);

  if (!notification) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 px-2.5 pt-2.5 safe-top pointer-events-none">
      <button
        onClick={() => {
          onOpen(notification.stationId, notification.chargerId);
          dismissNotification();
          clearSession();
        }}
        className="w-full max-w-md mx-auto flex items-start gap-2.5 rounded-2xl bg-[#1c1c1e]/95 backdrop-blur border border-white/10 shadow-2xl px-3 py-2.5 text-left animate-push-notification-in pointer-events-auto"
      >
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 mt-0.5">
          <Zap size={18} className="text-textOnAction" fill="currentColor" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-semibold text-white/90">iRA.ev</span>
            <span className="text-[12px] text-white/50 shrink-0">{relativeTime(notification.firedAt, now)}</span>
          </div>
          <p className="text-[14px] font-semibold text-white mt-0.5">gun connected &amp; verified</p>
          <p className="text-[12px] text-white/70 mt-0.5 leading-snug">
            {notification.chargerLabel} at {notification.stationName} — tap to start charging
          </p>
        </div>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            dismissNotification();
          }}
          className="text-white/40 shrink-0 p-1 -m-1"
        >
          <X size={14} />
        </span>
      </button>
    </div>
  );
}
