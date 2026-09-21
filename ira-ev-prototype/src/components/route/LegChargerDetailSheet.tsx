import { Bath, IndianRupee, Mountain, Recycle, Star, UtensilsCrossed, Wifi, Zap } from "lucide-react";
import type { Amenity } from "../../types/route";
import type { LegChargerOption } from "../../types/legByLeg";
import { BottomSheet } from "../common/BottomSheet";
import { Button } from "../common/Button";
import { CpoLogo } from "../common/CpoLogo";
import { Rating } from "../common/Rating";
import { StationPhotoCarousel } from "../station/StationPhotoCarousel";
import { PaymentStatus } from "../station/PaymentStatus";
import { formatDuration } from "../../utils/routePlanner";
import { routeStationId } from "../../utils/routeChargerBridge";
import { hashString } from "../../utils/hash";

const AMENITY_ICON: Record<Amenity, typeof UtensilsCrossed> = {
  food: UtensilsCrossed,
  restroom: Bath,
  wifi: Wifi,
};

/** Deterministic mock rating for a route charger — the mock highway dataset has no rating
 * field of its own (unlike city stations), so this fills in a plausible, stable 3.5-4.9. */
function syntheticRating(chargerId: string): number {
  return Math.round((3.5 + (hashString(chargerId) % 15) / 10) * 10) / 10;
}

interface LegChargerDetailSheetProps {
  option: LegChargerOption | null;
  onClose: () => void;
  onChoose: (chargerId: string) => void;
  onStartCharging?: (routeChargerId: string, prefill: { units: number; amount: number }) => void;
}

/** Full-detail preview of one leg's charger option — recommended or backup — opened by tapping
 * a `LegOptionCard`. Shows everything the short station card would (photos, rating, amenities,
 * payment status) plus this leg's actual drive/charge simulation, so the driver can compare
 * options properly instead of picking off a summary card alone. */
export function LegChargerDetailSheet({ option, onClose, onChoose, onStartCharging }: LegChargerDetailSheetProps) {
  if (!option) return null;
  const { charger, isRecommended, rerouteDistanceKm, driveLeg, chargeLeg } = option;
  const rating = syntheticRating(charger.id);
  const stationId = routeStationId(charger.id);
  const heightPx = Math.round(window.innerHeight * 0.92);

  const handleSelect = () => {
    onChoose(charger.id);
    onClose();
  };

  const handleSelectAndGoToGun = () => {
    onChoose(charger.id);
    onClose();
    onStartCharging?.(charger.id, { units: chargeLeg.energyAddedKwh, amount: chargeLeg.costEstimate });
  };

  return (
    <BottomSheet
      open={!!option}
      onClose={onClose}
      heightPx={heightPx}
      footer={
        <div className="flex gap-3">
          {onStartCharging && (
            <Button variant="outline" onClick={handleSelectAndGoToGun}>
              select &amp; go to gun
            </Button>
          )}
          <Button variant="primary" onClick={handleSelect}>
            select this charger
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 pb-2">
        <PaymentStatus status="enabled" />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {isRecommended ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/15 px-1.5 py-0.5 rounded-pill mb-1">
                <Star size={9} className="fill-primary" />
                recommended
              </span>
            ) : (
              <span className="inline-block text-[10px] font-medium text-warning bg-warning/15 px-1.5 py-0.5 rounded-pill mb-1">
                ~{Math.round(rerouteDistanceKm)}km reroute from recommended
              </span>
            )}
            <p className="text-[14px] text-secondaryText">{charger.cpo}</p>
            <h2 className="text-[18px] font-semibold leading-snug mt-0.5">{charger.name}</h2>
          </div>
          <CpoLogo cpo={charger.cpo} />
        </div>

        <div className="flex items-center justify-between text-[14px]">
          <div className="flex items-center gap-1.5">
            <span className="text-primary font-medium">ev rating</span>
            <Rating value={rating} />
          </div>
          {charger.amenities.length > 0 && (
            <div className="flex items-center gap-2.5 text-secondaryText">
              {charger.amenities.map((a) => {
                const Icon = AMENITY_ICON[a];
                return <Icon key={a} size={16} />;
              })}
            </div>
          )}
        </div>

        <StationPhotoCarousel stationId={stationId} />

        <div className="flex items-stretch justify-between rounded-card bg-surfaceRaised border border-border px-3 py-3">
          <div className="flex-1 text-center">
            <p className="text-[12px] text-secondaryText lowercase">connector</p>
            <p className="text-[14px] font-semibold mt-0.5">{charger.connector}</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center">
            <p className="text-[12px] text-secondaryText lowercase">power</p>
            <p className="text-[14px] font-semibold mt-0.5">{charger.powerKw}kW</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center">
            <p className="text-[12px] text-secondaryText lowercase">price</p>
            <p className="text-[14px] font-semibold mt-0.5">₹{charger.pricePerKwh}/kWh</p>
          </div>
        </div>

        <div className="rounded-card bg-surfaceRaised border border-border p-3.5 flex flex-col gap-2.5">
          <p className="text-[14px] font-medium flex items-center gap-1.5">
            <Zap size={13} className="text-primary" />
            this leg
          </p>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-secondaryText">drive here</span>
            <span className="text-text font-medium">
              {driveLeg.distanceKm}km · {formatDuration(driveLeg.durationMin)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-secondaryText">SoC on arrival</span>
            <span className="text-text font-medium">{driveLeg.socEnd}%</span>
          </div>
          {(driveLeg.elevationGainM > 0 || driveLeg.elevationLossM > 0) && (
            <div className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-1.5 text-secondaryText">
                <Mountain size={11} />
                elevation
              </span>
              <span className="text-text font-medium flex items-center gap-1.5">
                +{driveLeg.elevationGainM}m / -{driveLeg.elevationLossM}m
                {driveLeg.regenRecoveredKwh > 0 && (
                  <span className="flex items-center gap-1 text-primary">
                    <Recycle size={11} />
                    {driveLeg.regenRecoveredKwh}kWh
                  </span>
                )}
              </span>
            </div>
          )}
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-secondaryText">charge here</span>
            <span className="text-text font-medium">
              {chargeLeg.arrivalSocPercent}% → {chargeLeg.departureSocPercent}%
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-secondaryText">charge time</span>
            <span className="text-text font-medium">
              {formatDuration(chargeLeg.chargeDurationMin)} · +{chargeLeg.energyAddedKwh}kWh
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-secondaryText">estimated cost</span>
            <span className="flex items-center gap-0.5 text-primary font-semibold">
              <IndianRupee size={12} />
              {chargeLeg.costEstimate}
            </span>
          </div>
          {chargeLeg.mealStopLabel && (
            <div className="flex items-center gap-1.5 text-[12px] text-primary">
              <UtensilsCrossed size={11} />
              lands near {chargeLeg.mealStopLabel}
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
