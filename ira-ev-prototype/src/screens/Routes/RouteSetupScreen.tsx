import { useState } from "react";
import { MapPin, Flag, ArrowUpDown, BatteryCharging, BatteryFull } from "lucide-react";
import { ScreenHeader } from "../../components/navigation/ScreenHeader";
import { Button } from "../../components/common/Button";
import { StickyFooter } from "../../components/common/StickyFooter";
import { Slider } from "../../components/common/Slider";
import { LocationField } from "../../components/route/LocationField";
import { LocationPickerModal } from "../../components/route/LocationPickerModal";
import { WaypointList } from "../../components/route/WaypointList";
import { VehicleSelector } from "../../components/route/VehicleSelector";
import { AdvancedOptionsPanel } from "../../components/route/AdvancedOptionsPanel";
import { getLocationById } from "../../data/routeLocations";
import type { RoutePlannerApi } from "../../hooks/useRoutePlanner";

export function RouteSetupScreen({ planner }: { planner: RoutePlannerApi }) {
  const [pickerTarget, setPickerTarget] = useState<"start" | "destination" | null>(null);
  const startLoc = getLocationById(planner.startId);
  const destLoc = getLocationById(planner.destinationId);

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="plan a trip" onBack={() => {}} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4">
        <div className="flex flex-col gap-4 py-4">
          <div className="relative flex flex-col gap-2">
            <LocationField
              icon={MapPin}
              label="from"
              value={startLoc?.label ?? "select start"}
              onClick={() => setPickerTarget("start")}
            />
            <LocationField
              icon={Flag}
              iconColor="text-error"
              label="to"
              value={destLoc?.label ?? "select destination"}
              onClick={() => setPickerTarget("destination")}
            />
            <button
              onClick={planner.reverseTrip}
              aria-label="Swap start and destination"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center active:opacity-70"
            >
              <ArrowUpDown size={15} className="text-primary" />
            </button>
          </div>

          <WaypointList
            waypointIds={planner.waypointIds}
            onAdd={planner.addWaypoint}
            onRemove={planner.removeWaypoint}
            excludeIds={[planner.startId, planner.destinationId]}
          />

          <div className="h-px bg-border" />

          <div>
            <p className="text-[14px] font-medium mb-2.5">your vehicle</p>
            <VehicleSelector selectedId={planner.preferences.vehicleId} onSelect={(id) => planner.updatePreferences({ vehicleId: id })} />
          </div>

          <div className="rounded-card bg-surfaceRaised border border-border p-3.5 flex flex-col gap-4">
            <Slider
              label="starting charge"
              value={planner.preferences.startSocPercent}
              onChange={(v) => planner.updatePreferences({ startSocPercent: v })}
              min={5}
              max={100}
            />
            <Slider
              label="minimum charge on arrival"
              value={planner.preferences.targetArrivalSocPercent}
              onChange={(v) => planner.updatePreferences({ targetArrivalSocPercent: v })}
              min={5}
              max={80}
              helperText="how much battery you'd like left when you reach your destination"
            />
            <Slider
              label="never charge below"
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
        </div>
      </div>

      <StickyFooter>
        <Button disabled={!startLoc || !destLoc || startLoc.id === destLoc.id} onClick={planner.planTrip}>
          plan route
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
