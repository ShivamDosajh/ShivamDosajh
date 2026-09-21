import { PlugZap, Radio, ShieldCheck, CheckCircle2, type LucideIcon } from "lucide-react";
import { useOneClickCharging } from "../../hooks/useOneClickCharging";
import type { OneClickStage } from "../../types/oneClickCharging";

interface GunConnectPromptProps {
  stationId: string;
  stationName: string;
  chargerId: string;
  chargerLabel: string;
}

const STAGE_COPY: Record<OneClickStage, { label: string; icon: LucideIcon }> = {
  connecting: { label: "connecting to charger", icon: PlugZap },
  "verifying-ocpi": { label: "verifying gun via OCPI", icon: Radio },
  authenticating: { label: "authenticating your vehicle", icon: ShieldCheck },
  verified: { label: "verified — sending you a notification", icon: CheckCircle2 },
};

/**
 * The "plug in the gun" step of one-click charging has no real hardware to trigger it in a
 * prototype, so this stands in for that physical action — everything after the tap (OCPI
 * verification, telematics auth, push notification) runs exactly as it would from a real
 * gun-connect event.
 */
export function GunConnectPrompt({ stationId, stationName, chargerId, chargerLabel }: GunConnectPromptProps) {
  const { session, notification, startGunConnect } = useOneClickCharging();

  const activeHere = session && session.stationId === stationId && session.chargerId === chargerId;
  const notifiedHere = notification && notification.stationId === stationId && notification.chargerId === chargerId;

  if (notifiedHere) {
    return (
      <div className="rounded-card border border-primary/40 bg-primary/10 px-3.5 py-3">
        <p className="flex items-center gap-2 text-[14px] font-medium text-primary">
          <CheckCircle2 size={15} />
          gun verified — check your notification
        </p>
      </div>
    );
  }

  if (activeHere) {
    const stageOrder: OneClickStage[] = ["connecting", "verifying-ocpi", "authenticating", "verified"];
    const activeIndex = stageOrder.indexOf(session.stage);
    return (
      <div className="rounded-card border border-primary/30 bg-surfaceRaised px-3.5 py-3 flex flex-col gap-2">
        {stageOrder.map((stage, i) => {
          const { label, icon: Icon } = STAGE_COPY[stage];
          const done = i < activeIndex || session.stage === "verified";
          const active = i === activeIndex && session.stage !== "verified";
          return (
            <div key={stage} className="flex items-center gap-2.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  done ? "bg-primary text-textOnAction" : active ? "bg-primary/20 text-primary animate-pulse" : "bg-surface text-secondaryText"
                }`}
              >
                <Icon size={12} />
              </div>
              <span className={`text-[12px] ${done || active ? "text-text" : "text-secondaryText"}`}>{label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <button
      onClick={() => startGunConnect(stationId, stationName, chargerId, chargerLabel)}
      className="w-full flex items-center gap-3 rounded-card border border-dashed border-primary/40 px-3.5 py-3 min-h-[44px] text-left"
    >
      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary">
        <PlugZap size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] text-text font-medium">simulate: gun connected</p>
        <p className="text-[12px] text-secondaryText">one-tap charging will verify &amp; notify you</p>
      </div>
    </button>
  );
}
