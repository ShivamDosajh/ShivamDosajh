import { AlertTriangle, BatteryCharging, Clock, Info, Siren, Zap } from "lucide-react";
import { ScreenHeader } from "../../components/navigation/ScreenHeader";
import { Button } from "../../components/common/Button";
import { BottomSheet } from "../../components/common/BottomSheet";
import { RouteMapPreview } from "../../components/route/RouteMapPreview";
import { getChargerById } from "../../data/routeChargers";
import type { AdvancedRoutePlannerApi, LiveTripAlert } from "../../hooks/useAdvancedRoutePlanner";

const ALERT_STYLES: Record<LiveTripAlert["level"], { icon: typeof Info; classes: string; label: string }> = {
  info: { icon: Info, classes: "bg-primary/15 border-primary text-primary", label: "info" },
  warning: { icon: AlertTriangle, classes: "bg-warning/15 border-warning text-warning", label: "warning" },
  critical: { icon: Siren, classes: "bg-error/15 border-error text-error", label: "critical" },
};

export function LiveTripScreen({ planner, onEnd }: { planner: AdvancedRoutePlannerApi; onEnd: () => void }) {
  const { plan } = planner;
  if (!plan) return null;

  const nextCharge = plan.legs.find((leg) => leg.kind === "charge");
  const predictedSoc = nextCharge?.kind === "charge" ? nextCharge.arrivalSocPercent : plan.arrivalSoc;
  // Demo-only: "actual" drifts a few points below plan so the strip has something real to show.
  const actualSoc = Math.max(0, predictedSoc - 3);

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="live trip" onBack={onEnd} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4">
        <div className="flex flex-col gap-4 py-4">
          <RouteMapPreview plan={plan} startId={planner.startId} destinationId={planner.destinationId} waypointRefs={[]} />

          <div className="rounded-card bg-surfaceRaised border border-border p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary">
              <Zap size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-secondaryText lowercase">next charger</p>
              <p className="text-[14px] font-medium truncate">{nextCharge?.kind === "charge" ? nextCharge.charger.name : "destination"}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[12px] text-secondaryText lowercase">predicted / actual SoC</p>
              <p className="text-[14px] font-medium">
                {predictedSoc}% <span className="text-secondaryText">/ {actualSoc}%</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[12px] text-secondaryText">
            <Clock size={14} className="text-primary shrink-0" />
            ETA {nextCharge?.kind === "charge" ? nextCharge.etaClock : ""} · ride guarded — you'll be alerted before a problem, not
            after
          </div>

          <div className="rounded-card border border-dashed border-border p-3.5 flex flex-col gap-2.5">
            <p className="text-[12px] text-secondaryText">demo controls — simulate an in-trip alert</p>
            <div className="flex gap-2">
              <button
                onClick={() => planner.triggerDemoAlert("info")}
                className="flex-1 h-9 rounded-button border border-primary text-primary text-[12px] font-medium"
              >
                info
              </button>
              <button
                onClick={() => planner.triggerDemoAlert("warning")}
                className="flex-1 h-9 rounded-button border border-warning text-warning text-[12px] font-medium"
              >
                warning
              </button>
              <button
                onClick={() => planner.triggerDemoAlert("critical")}
                className="flex-1 h-9 rounded-button border border-error text-error text-[12px] font-medium"
              >
                critical
              </button>
            </div>
          </div>

          <Button variant="outline" onClick={onEnd}>
            end trip
          </Button>
        </div>
      </div>

      <BottomSheet
        open={!!planner.liveAlert}
        onClose={planner.dismissAlert}
        heightPx={Math.min(520, Math.round(window.innerHeight * 0.65))}
        footer={
          <Button variant="outline" onClick={planner.dismissAlert}>
            dismiss
          </Button>
        }
      >
        {planner.liveAlert && (
          <div className="flex flex-col gap-3 pb-2">
            {(() => {
              const style = ALERT_STYLES[planner.liveAlert.level];
              const Icon = style.icon;
              return (
                <div className={`rounded-card border p-3.5 flex items-start gap-3 ${style.classes}`}>
                  <Icon size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[12px] font-semibold uppercase">{style.label}</p>
                    <p className="text-[13px] text-text mt-1 leading-relaxed">{planner.liveAlert.message}</p>
                  </div>
                </div>
              );
            })()}

            {planner.liveAlert.alternativeChargerIds.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[13px] font-medium">alternative chargers</p>
                {planner.liveAlert.alternativeChargerIds.map((id) => {
                  const charger = getChargerById(id);
                  if (!charger) return null;
                  return (
                    <div key={id} className="flex items-center gap-3 rounded-card bg-surfaceRaised border border-border px-3.5 py-3">
                      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary">
                        <BatteryCharging size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate">{charger.name}</p>
                        <p className="text-[11px] text-secondaryText">
                          {charger.connector} · {charger.powerKw}kW · ₹{charger.pricePerKwh}/kWh
                        </p>
                      </div>
                      <button
                        onClick={planner.dismissAlert}
                        className="h-8 px-3 rounded-button bg-primary text-textOnAction text-[12px] font-semibold shrink-0"
                      >
                        switch
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
