import { useState } from "react";
import { Car, Zap, MapPinned, IndianRupee, Mountain, Recycle, UtensilsCrossed, Wifi, Bath } from "lucide-react";
import type { Amenity, DriveLeg, ChargeLeg } from "../../types/route";
import { formatDuration } from "../../utils/routePlanner";
import { useExperiments } from "../../hooks/useExperiments";
import { useZomatoOrder } from "../../hooks/useZomatoOrder";
import { getRestaurantById, toZomatoRestaurant } from "../../data/restaurants";
import { getZomatoRestaurantForStation } from "../../data/zomatoRestaurants";
import { ZomatoOrderModal } from "../zomato/ZomatoOrderModal";
import { ZomatoOrderStatusCard } from "../zomato/ZomatoOrderStatusCard";

const AMENITY_ICON: Record<Amenity, typeof UtensilsCrossed> = {
  food: UtensilsCrossed,
  restroom: Bath,
  wifi: Wifi,
};

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

export function ChargeLegRow({ leg }: { leg: ChargeLeg }) {
  const { config } = useExperiments();
  const { order } = useZomatoOrder();
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const pickedRestaurant = leg.restaurantId ? getRestaurantById(leg.restaurantId) : undefined;
  const zomatoRestaurant = pickedRestaurant
    ? toZomatoRestaurant(pickedRestaurant)
    : getZomatoRestaurantForStation(leg.charger.id);
  const activeOrderHere = order && order.stationId === leg.charger.id ? order : null;

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
                  eating at
                </p>
                <p className="text-[14px] font-medium">{pickedRestaurant.name}</p>
                <p className="text-[11px] text-secondaryText mt-0.5">charging at {leg.charger.name}</p>
              </>
            ) : (
              <>
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
                  order from {zomatoRestaurant.name} — arrives when you get here
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      <ZomatoOrderModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        stationId={leg.charger.id}
        stationName={leg.charger.name}
        restaurant={zomatoRestaurant}
        arrivalLabel={leg.etaClock}
      />
    </div>
  );
}
