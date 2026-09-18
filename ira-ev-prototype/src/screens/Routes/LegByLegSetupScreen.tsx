import { useState } from "react";
import { ArrowUpDown, BatteryCharging, BatteryFull, ChevronRight, Flag } from "lucide-react";
import { ScreenHeader } from "../../components/navigation/ScreenHeader";
import { Button } from "../../components/common/Button";
import { StickyFooter } from "../../components/common/StickyFooter";
import { Slider } from "../../components/common/Slider";
import { LocationPickerModal } from "../../components/route/LocationPickerModal";
import { ConnectedVehicleCard } from "../../components/route/ConnectedVehicleCard";
import { AdvancedOptionsPanel } from "../../components/route/AdvancedOptionsPanel";
import { getLocationById } from "../../data/routeLocations";
import type { LegByLegPlannerApi } from "../../hooks/useLegByLegPlanner";

export function LegByLegSetupScreen({ planner, onBack }: { planner: LegByLegPlannerApi; onBack: () => void }) {
  const [pickerTarget, setPickerTarget] = useState<"start" | "destination" | null>(null);
  const startLoc = getLocationById(planner.startId);
  const destLoc = getLocationById(planner.destinationId);

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="build a trip leg by leg" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4">
        <div className="flex flex-col gap-4 py-4">
          <div className="rounded-card bg-surfaceRaised border border-border overflow-hidden relative">
            <button
              onClick={planner.reverseTrip}
              aria-label="Swap start and destination"
              className="absolute right-3 top-3 z-10 w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center active:opacity-70"
            >
              <ArrowUpDown size={15} className="text-primary" />
            </button>
            <div className="absolute left-[27px] top-[26px] bottom-[26px] w-px bg-border" />
            <div className="relative flex flex-col">
              <button onClick={() => setPickerTarget("start")} className="flex items-center gap-3 px-3.5 py-3 min-h-[44px] text-left pr-14">
                <div className="w-8 h-8 rounded-full bg-background border-2 border-black flex items-center justify-center shrink-0 relative z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-black" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-secondaryText lowercase">from</p>
                  <p className="text-[15px] text-text font-medium truncate">{startLoc?.label ?? "select start"}</p>
                </div>
                <ChevronRight size={16} className="text-secondaryText shrink-0" />
              </button>
              <button onClick={() => setPickerTarget("destination")} className="flex items-center gap-3 px-3.5 py-3 min-h-[44px] text-left">
                <div className="w-8 h-8 rounded-full bg-error border-2 border-white flex items-center justify-center shrink-0 relative z-10 shadow">
                  <Flag size={13} className="text-white" fill="white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-secondaryText lowercase">to</p>
                  <p className="text-[15px] text-text font-medium truncate">{destLoc?.label ?? "select destination"}</p>
                </div>
                <ChevronRight size={16} className="text-secondaryText shrink-0" />
              </button>
            </div>
          </div>

          <ConnectedVehicleCard />

          <div className="rounded-card bg-surfaceRaised border border-border p-3.5 flex flex-col gap-4">
            <Slider
              label="starting SoC"
              value={planner.preferences.startSocPercent}
              onChange={(v) => planner.updatePreferences({ startSocPercent: v })}
              min={5}
              max={100}
              helperText="auto-filled from your car's live battery — adjust if you'll leave later"
            />
            <Slider
              label="minimum SoC on arrival"
              value={planner.preferences.targetArrivalSocPercent}
              onChange={(v) => planner.updatePreferences({ targetArrivalSocPercent: v })}
              min={5}
              max={80}
              helperText="how much battery you'd like left when you reach your destination"
            />
            <Slider
              label="Minimum acceptable SoC during trip"
              value={planner.preferences.minChargeSocPercent}
              onChange={(v) => planner.updatePreferences({ minChargeSocPercent: v })}
              min={5}
              max={30}
              helperText="safety reserve kept between charging stops"
            />
          </div>

          <AdvancedOptionsPanel preferences={planner.preferences} onChange={planner.updatePreferences} />

          <div className="flex items-center gap-2 text-[12px] text-secondaryText">
            <BatteryCharging size={14} className="text-primary shrink-0" />
            <span>starting charge</span>
            <span className="text-text font-medium">{planner.preferences.startSocPercent}%</span>
            <span className="mx-1">·</span>
            <BatteryFull size={14} className="text-primary shrink-0" />
            <span>target arrival</span>
            <span className="text-text font-medium">{planner.preferences.targetArrivalSocPercent}%+</span>
          </div>

          <p className="text-[11px] text-secondaryText leading-relaxed">
            we'll split this trip into legs based on your car's range and preferences — you'll pick a
            charger for each leg yourself as you go, instead of getting one fixed itinerary up front.
          </p>
        </div>
      </div>

      <StickyFooter>
        <Button disabled={!startLoc || !destLoc || startLoc.id === destLoc.id} onClick={planner.startBuilding}>
          start building trip
        </Button>
      </StickyFooter>

      <LocationPickerModal
        open={pickerTarget === "start"}
        onClose={() => setPickerTarget(null)}
        onSelect={planner.setStartId}
        title="Choose start location"
        excludeIds={[planner.destinationId]}
      />
      <LocationPickerModal
        open={pickerTarget === "destination"}
        onClose={() => setPickerTarget(null)}
        onSelect={planner.setDestinationId}
        title="Choose destination"
        excludeIds={[planner.startId]}
      />
    </div>
  );
}
