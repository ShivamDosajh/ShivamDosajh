import { useState } from "react";
import { BatteryCharging, Gauge, Minus, Plus, Wind } from "lucide-react";
import { ScreenHeader } from "../../components/navigation/ScreenHeader";
import { Button } from "../../components/common/Button";
import { StickyFooter } from "../../components/common/StickyFooter";
import { Slider } from "../../components/common/Slider";
import { Chip } from "../../components/common/Chip";
import { Toggle } from "../../components/common/Toggle";
import { LocationPickerModal } from "../../components/route/LocationPickerModal";
import { TripStopsList } from "../../components/route/TripStopsList";
import { ConnectedVehicleCard } from "../../components/route/ConnectedVehicleCard";
import { AdvancedOptionsPanel } from "../../components/route/AdvancedOptionsPanel";
import { getLocationById } from "../../data/routeLocations";
import { myConnectedVehicle } from "../../data/vehicles";
import type { AdvancedRoutePlannerApi } from "../../hooks/useAdvancedRoutePlanner";
import type { ChargeStopStrategy } from "../../types/route";

const TRIP_TYPE_CHIPS: { value: ChargeStopStrategy; label: string }[] = [
  { value: "cheapest", label: "Cheapest" },
  { value: "fastest", label: "Fastest" },
  { value: "amenities", label: "Amenities" },
];

let mealStopIdCounter = 0;
function newMealStopId(): string {
  mealStopIdCounter += 1;
  return `meal-v2-${Date.now()}-${mealStopIdCounter}`;
}

export function AdvancedTripInputsScreen({ planner, onBack }: { planner: AdvancedRoutePlannerApi; onBack: () => void }) {
  const [pickerTarget, setPickerTarget] = useState<"start" | "destination" | null>(null);
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const startLoc = getLocationById(planner.startId);
  const destLoc = getLocationById(planner.destinationId);
  const rangeKm = Math.round(
    (myConnectedVehicle.batteryCapacityKwh * (myConnectedVehicle.currentSocPercent / 100) * 1000) /
      myConnectedVehicle.efficiencyWhPerKm
  );

  const addMealStop = () => {
    planner.updatePreferences({
      mealStops: [...planner.preferences.mealStops, { id: newMealStopId(), label: "stop", time: "16:00" }],
    });
  };
  const updateMealStop = (id: string, patch: Partial<{ label: string; time: string }>) => {
    planner.updatePreferences({
      mealStops: planner.preferences.mealStops.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    });
  };
  const removeMealStop = (id: string) => {
    planner.updatePreferences({ mealStops: planner.preferences.mealStops.filter((m) => m.id !== id) });
  };

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="plan a trip" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4">
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-[16px] font-semibold">route details</p>
            <span className="flex items-center gap-1.5 text-[14px] text-text">
              <BatteryCharging size={18} />
              {myConnectedVehicle.currentSocPercent}% - {rangeKm} km
            </span>
          </div>

          <TripStopsList
            startLabel={startLoc?.label ?? "select start"}
            destinationLabel={destLoc?.label ?? "select destination"}
            onStartClick={() => setPickerTarget("start")}
            onDestinationClick={() => setPickerTarget("destination")}
            onSwap={planner.reverseTrip}
            waypointRefs={planner.waypointRefs}
            onAdd={planner.addWaypoint}
            onRemove={planner.removeWaypoint}
            onReorder={() => {}}
            excludeRefs={[`loc:${planner.startId}`, `loc:${planner.destinationId}`]}
          />

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
              label="minimum acceptable SoC during trip"
              value={planner.preferences.minChargeSocPercent}
              onChange={(v) => planner.updatePreferences({ minChargeSocPercent: v })}
              min={5}
              max={30}
              helperText="no leg is ever planned to arrive below this"
            />
            <Slider
              label="end SoC target"
              value={planner.preferences.targetArrivalSocPercent}
              onChange={(v) => planner.updatePreferences({ targetArrivalSocPercent: v })}
              min={5}
              max={80}
              helperText="how much battery you'd like left when you reach your destination"
            />
            <Slider
              label="max re-routing allowed"
              value={planner.tripConditions.maxReroutingKm}
              onChange={(v) => planner.updateTripConditions({ maxReroutingKm: v })}
              min={1}
              max={20}
              unit=" km"
              helperText="how far off-route a recommended charger is allowed to detour"
            />
          </div>

          <div>
            <p className="text-[14px] text-text mb-2">trip type</p>
            <div className="flex gap-2">
              {TRIP_TYPE_CHIPS.map((opt) => (
                <Chip
                  key={opt.value}
                  active={planner.preferences.chargeStopStrategy === opt.value}
                  onClick={() => planner.updatePreferences({ chargeStopStrategy: opt.value })}
                >
                  {opt.label}
                </Chip>
              ))}
            </div>

            {planner.preferences.chargeStopStrategy === "amenities" && (
              <div className="flex flex-col gap-2 mt-3">
                <p className="text-[12px] text-secondaryText lowercase">meal stops — add, remove, or rename freely</p>
                {planner.preferences.mealStops.map((stop) => (
                  <div key={stop.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={stop.label}
                      onChange={(e) => updateMealStop(stop.id, { label: e.target.value })}
                      placeholder="label"
                      className="flex-1 min-w-0 h-9 rounded-button bg-background border border-border px-2.5 text-[12px] outline-none"
                    />
                    <input
                      type="time"
                      value={stop.time}
                      onChange={(e) => updateMealStop(stop.id, { time: e.target.value })}
                      className="h-9 rounded-button bg-background border border-border px-2 text-[12px] outline-none shrink-0"
                    />
                    <button
                      onClick={() => removeMealStop(stop.id)}
                      className="text-secondaryText shrink-0 p-1.5 -m-1.5"
                      aria-label={`remove ${stop.label}`}
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addMealStop}
                  className="flex items-center justify-center gap-1.5 h-9 rounded-button border border-dashed border-primary/40 text-primary text-[12px] font-medium mt-1"
                >
                  <Plus size={13} />
                  add meal stop
                </button>
              </div>
            )}
          </div>

          <div className="rounded-card bg-surfaceRaised border border-border overflow-hidden">
            <button
              onClick={() => setConditionsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3.5 py-3 min-h-[44px]"
            >
              <span className="text-[14px] font-medium text-text">trip conditions</span>
              <span className="text-[12px] text-secondaryText">{conditionsOpen ? "hide" : "show"}</span>
            </button>

            {conditionsOpen && (
              <div className="px-3.5 pb-4 flex flex-col gap-4 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-text">passengers</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => planner.updateTripConditions({ passengers: Math.max(1, planner.tripConditions.passengers - 1) })}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text active:bg-background"
                      aria-label="fewer passengers"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-[14px] font-medium w-4 text-center">{planner.tripConditions.passengers}</span>
                    <button
                      onClick={() => planner.updateTripConditions({ passengers: Math.min(7, planner.tripConditions.passengers + 1) })}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text active:bg-background"
                      aria-label="more passengers"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[14px] text-text">
                    <Wind size={15} className="text-secondaryText" />
                    climate control running
                  </span>
                  <Toggle
                    checked={planner.preferences.climateControlOn}
                    onChange={(v) => planner.updatePreferences({ climateControlOn: v })}
                    label="climate control running"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-text">driving side</span>
                  <span className="text-[14px] text-secondaryText">{planner.tripConditions.drivingSide} (auto)</span>
                </div>

                <div className="flex items-center gap-2 text-[12px] text-secondaryText">
                  <Gauge size={14} className="text-primary shrink-0" />
                  your efficiency: {myConnectedVehicle.efficiencyWhPerKm} Wh/km (from last 30 days)
                </div>
              </div>
            )}
          </div>

          <AdvancedOptionsPanel preferences={planner.preferences} onChange={planner.updatePreferences} />
        </div>
      </div>

      <StickyFooter>
        <Button disabled={!startLoc || !destLoc || startLoc.id === destLoc.id} onClick={planner.planRoute}>
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
