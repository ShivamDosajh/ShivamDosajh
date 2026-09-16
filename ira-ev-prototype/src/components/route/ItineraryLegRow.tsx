import { useState } from "react";
import {
  Car,
  Zap,
  MapPinned,
  IndianRupee,
  Mountain,
  Recycle,
  UtensilsCrossed,
  Wifi,
  Bath,
  ArrowRight,
  ShieldAlert,
  Undo2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Amenity, DriveLeg, ChargeLeg, RouteCharger } from "../../types/route";
import { formatDuration } from "../../utils/routePlanner";
import { useExperiments } from "../../hooks/useExperiments";
import { useZomatoOrder } from "../../hooks/useZomatoOrder";
import { getRestaurantById, toZomatoRestaurant } from "../../data/restaurants";
import { getZomatoRestaurantsForStation } from "../../data/zomatoRestaurants";
import { foodStopCta } from "../../utils/foodStopWording";
import { ZomatoOrderFlow } from "../zomato/ZomatoOrderFlow";
import { ZomatoOrderStatusCard } from "../zomato/ZomatoOrderStatusCard";

const AMENITY_ICON: Record<Amenity, typeof UtensilsCrossed> = {
  food: UtensilsCrossed,
  restroom: Bath,
  wifi: Wifi,
};

/** How far from the original charger a station can be and still count as a "backup" for it. */
/** Consecutive route chargers sit roughly 40-80km apart, so this covers "the next station
 * over" in either direction without reaching two hops away — anything past that isn't a
 * realistic detour, it's a different leg of the trip. */
const NEARBY_BACKUP_RADIUS_KM = 70;
const MAX_BACKUP_OPTIONS = 3;

export function DriveLegRow({ leg }: { leg: DriveLeg }) {
  return (
    <div className="flex gap-3 py-2.5">
      <div className="w-9 flex flex-col items-center shrink-0">
        <div className="w-8 h-8 rounded-full bg-surfaceRaised border border-border flex items-center justify-center text-secondaryText">
          {leg.isWaypointArrival ? <MapPinned size={13} className="text-warning" /> : <Car size={13} />}
        </div>
        <div className="w-px flex-1 bg-border mt-1" />
      </div>
      <div className="flex-1 pb-1">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-text">
            drive to <span className="font-medium">{leg.toLabel}</span>
          </p>
          <span className="text-[11px] text-secondaryText shrink-0">ETA {leg.etaClock}</span>
        </div>
        <p className="text-[12px] text-secondaryText mt-0.5">
          {leg.distanceKm} km · {formatDuration(leg.durationMin)} · SoC {leg.socStart}% → {leg.socEnd}%
        </p>
        {(leg.elevationGainM > 0 || leg.elevationLossM > 0) && (
          <p className="flex items-center gap-1.5 text-[11px] text-secondaryText mt-1">
            <Mountain size={11} />
            +{leg.elevationGainM}m / -{leg.elevationLossM}m
            {leg.regenRecoveredKwh > 0 && (
              <span className="flex items-center gap-1 text-primary ml-1.5">
                <Recycle size={11} />
                {leg.regenRecoveredKwh} kWh regen
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

interface ChargeLegRowProps {
  leg: ChargeLeg;
  /** Present only on the route-planner itinerary — jumps straight into the real charging
   * flow for this stop instead of making the driver find the charger on the map again. */
  onStartCharging?: (routeChargerId: string, prefill: { units: number; amount: number }) => void;
  /** All route chargers, for finding nearby backup options — omitted when backup-picking
   * isn't wired up for this rendering context (e.g. a mid-charge summary). */
  allChargers?: RouteCharger[];
  /** Original charger id -> backup charger id for stops the driver has already swapped. */
  chargerSwaps?: Record<string, string>;
  onSwapCharger?: (originalChargerId: string, backupChargerId: string | undefined) => void;
}

export function ChargeLegRow({ leg, onStartCharging, allChargers, chargerSwaps, onSwapCharger }: ChargeLegRowProps) {
  const { config } = useExperiments();
  const { order } = useZomatoOrder();
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [backupsOpen, setBackupsOpen] = useState(false);

  const pickedRestaurant = leg.restaurantId ? getRestaurantById(leg.restaurantId) : undefined;
  const fixedZomatoRestaurant = pickedRestaurant ? toZomatoRestaurant(pickedRestaurant) : undefined;
  const restaurantChoices = fixedZomatoRestaurant ? [fixedZomatoRestaurant] : getZomatoRestaurantsForStation(leg.charger.id);
  const activeOrderHere = order && order.stationId === leg.charger.id ? order : null;
  const chargerSubtitle = `${leg.charger.cpo} · ${leg.charger.connector} · ${leg.charger.powerKw}kW`;

  const swapOriginalId = chargerSwaps
    ? Object.entries(chargerSwaps).find(([, backupId]) => backupId === leg.charger.id)?.[0]
    : undefined;
  const backupOptions = allChargers
    ? allChargers
        .filter((c) => c.id !== leg.charger.id)
        .map((c) => ({ charger: c, deltaKm: Math.abs(c.distanceKm - leg.charger.distanceKm) }))
        .filter((c) => c.deltaKm <= NEARBY_BACKUP_RADIUS_KM)
        .sort((a, b) => a.deltaKm - b.deltaKm)
        .slice(0, MAX_BACKUP_OPTIONS)
    : [];

  return (
    <div className="flex gap-3 py-2.5">
      <div className="w-9 flex flex-col items-center shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary flex items-center justify-center text-primary">
          <Zap size={13} />
        </div>
        <div className="w-px flex-1 bg-border mt-1" />
      </div>
      <div className="flex-1 pb-1 rounded-card bg-surfaceRaised border border-border px-3 py-2.5">
        <div className="flex items-start justify-between">
          <div>
            {pickedRestaurant ? (
              <>
                <p className="text-[13px] text-secondaryText flex items-center gap-1">
                  <UtensilsCrossed size={11} />
                  {config.foodStopWording === "eat" ? "eating at" : "ordering from"}
                </p>
                <p className="text-[14px] font-medium">{pickedRestaurant.name}</p>
                <p className="text-[11px] text-secondaryText mt-0.5">charging at {leg.charger.name}</p>
              </>
            ) : (
              <>
                {leg.mealStopLabel && (
                  <p className="text-[13px] text-primary flex items-center gap-1">
                    <UtensilsCrossed size={11} />
                    near {leg.mealStopLabel}
                  </p>
                )}
                <p className="text-[13px] text-secondaryText">{leg.charger.cpo}</p>
                <p className="text-[14px] font-medium">{leg.charger.name}</p>
              </>
            )}
          </div>
          <span className="text-[11px] text-secondaryText shrink-0">ETA {leg.etaClock}</span>
        </div>
        {leg.charger.amenities.length > 0 && (
          <div className="flex items-center gap-2.5 mt-1.5">
            {leg.charger.amenities.map((a) => {
              const Icon = AMENITY_ICON[a];
              return (
                <span key={a} className="flex items-center gap-1 text-[11px] text-secondaryText capitalize">
                  <Icon size={11} />
                  {a}
                </span>
              );
            })}
          </div>
        )}
        <div className="flex items-center justify-between mt-1.5 text-[12px]">
          <span className="text-secondaryText">
            {leg.charger.connector} · {leg.charger.powerKw}kW
          </span>
          <span className="text-text font-medium">
            {leg.arrivalSocPercent}% → {leg.departureSocPercent}%
          </span>
        </div>
        <div className="flex items-center justify-between mt-1 text-[12px]">
          <span className="text-secondaryText">
            +{leg.energyAddedKwh} kWh · {formatDuration(leg.chargeDurationMin)}
          </span>
          <span className="flex items-center gap-0.5 text-primary font-medium">
            <IndianRupee size={11} />
            {leg.costEstimate}
          </span>
        </div>

        {onStartCharging && (
          <button
            onClick={() =>
              onStartCharging(leg.charger.id, { units: leg.energyAddedKwh, amount: leg.costEstimate })
            }
            className="w-full flex items-center justify-center gap-1.5 rounded-button bg-primary text-black text-[12px] font-semibold h-9 mt-2.5"
          >
            charge now
            <ArrowRight size={13} />
          </button>
        )}

        {onSwapCharger && (allChargers || swapOriginalId) && (
          <div className="mt-2">
            {swapOriginalId ? (
              <div className="flex items-center justify-between rounded-button bg-primary/10 px-2.5 py-2">
                <span className="flex items-center gap-1.5 text-[11px] text-primary">
                  <ShieldAlert size={12} />
                  using backup charger
                </span>
                <button
                  onClick={() => onSwapCharger(swapOriginalId, undefined)}
                  className="flex items-center gap-1 text-[11px] font-medium text-primary"
                >
                  <Undo2 size={11} />
                  undo
                </button>
              </div>
            ) : (
              <button
                onClick={() => setBackupsOpen((v) => !v)}
                className="w-full flex items-center justify-between text-[11px] text-secondaryText py-1"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldAlert size={12} />
                  charger not working? choose a backup
                </span>
                {backupsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            )}

            {backupsOpen && !swapOriginalId && (
              <div className="flex flex-col gap-1.5 mt-1.5">
                {backupOptions.length === 0 && (
                  <p className="text-[11px] text-secondaryText">no nearby backup chargers found</p>
                )}
                {backupOptions.map(({ charger: backup, deltaKm }) => (
                  <button
                    key={backup.id}
                    onClick={() => {
                      onSwapCharger(leg.charger.id, backup.id);
                      setBackupsOpen(false);
                    }}
                    className="flex items-center justify-between rounded-button border border-border px-2.5 py-2 text-left"
                  >
                    <span>
                      <span className="block text-[12px] font-medium text-text">{backup.name}</span>
                      <span className="block text-[11px] text-secondaryText">
                        {backup.connector} · {backup.powerKw}kW · ~{Math.round(deltaKm)}km away
                      </span>
                    </span>
                    <span className="flex items-center gap-0.5 text-[11px] text-primary shrink-0">
                      <IndianRupee size={10} />
                      {backup.pricePerKwh}/kWh
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {config.showZomatoOrdering && (
          <div className="mt-2.5">
            {activeOrderHere ? (
              <ZomatoOrderStatusCard order={activeOrderHere} />
            ) : (
              <button
                onClick={() => setOrderModalOpen(true)}
                className="w-full flex items-center gap-2.5 rounded-button border border-dashed border-primary/40 px-3 py-2.5 min-h-[40px] text-left"
              >
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary">
                  <UtensilsCrossed size={12} />
                </div>
                <span className="text-[12px] text-text font-medium">
                  {foodStopCta(config.foodStopWording, fixedZomatoRestaurant?.name)} — arrives when you get here
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      <ZomatoOrderFlow
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        stationId={leg.charger.id}
        stationName={leg.charger.name}
        restaurants={restaurantChoices}
        fixedRestaurant={fixedZomatoRestaurant}
        arrivalLabel={leg.etaClock}
        chargerSubtitle={chargerSubtitle}
      />
    </div>
  );
}
