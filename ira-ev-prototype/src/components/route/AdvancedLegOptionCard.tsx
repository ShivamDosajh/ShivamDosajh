import { BadgeCheck, Bath, Clock, IndianRupee, Plug, ShieldCheck, Star, UtensilsCrossed, Wifi, Zap } from "lucide-react";
import type { Amenity } from "../../types/route";
import type { LegChargerOption } from "../../types/legByLeg";
import { formatDuration } from "../../utils/routePlanner";
import { getChargerBadges, whyRecommended } from "../../utils/chargerBadges";

const AMENITY_ICON: Record<Amenity, typeof UtensilsCrossed> = {
  food: UtensilsCrossed,
  restroom: Bath,
  wifi: Wifi,
};

interface AdvancedLegOptionCardProps {
  option: LegChargerOption;
  onSelect: (chargerId: string) => void;
}

/** One of the PRD's "3 recommended chargers" — the same drive/charge preview the classic
 * leg-by-leg card shows, layered with the extra badges (reliability, live guns, reviews,
 * verified/MegaCharger) the PRD's charger card calls for. */
export function AdvancedLegOptionCard({ option, onSelect }: AdvancedLegOptionCardProps) {
  const { charger, isRecommended, rerouteDistanceKm, driveLeg, chargeLeg } = option;
  const badges = getChargerBadges(charger);

  return (
    <div
      className={`w-[272px] shrink-0 snap-start rounded-card border px-3.5 py-3.5 flex flex-col gap-2.5 ${
        isRecommended ? "border-primary bg-primary/10" : "border-border bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {isRecommended && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/15 px-1.5 py-0.5 rounded-pill mb-1">
              <Star size={9} className="fill-primary" />
              recommended
            </span>
          )}
          <p className="text-[12px] text-secondaryText truncate">{charger.cpo}</p>
          <p className="text-[14px] font-medium truncate">{charger.name}</p>
        </div>
        <span className="text-[11px] text-secondaryText shrink-0 text-right">
          {charger.connector}
          <br />
          {charger.powerKw}kW
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {badges.isMegaCharger && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-warning bg-warning/15 px-1.5 py-0.5 rounded-pill">
            <Zap size={9} />
            MegaCharger
          </span>
        )}
        {badges.verified && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/15 px-1.5 py-0.5 rounded-pill">
            <BadgeCheck size={9} />
            .ev verified
          </span>
        )}
        <span className="flex items-center gap-0.5 text-[11px] text-secondaryText">
          <Star size={10} className="fill-warning text-warning" />
          {badges.rating.toFixed(1)} ({badges.reviewCount})
        </span>
      </div>

      <p className="text-[11px] text-secondaryText leading-snug">{whyRecommended(charger, badges)}</p>

      <div className="h-px bg-border" />

      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
        <span className="flex items-center gap-1 text-secondaryText">
          <ShieldCheck size={11} />
          {badges.uptimePercent}% uptime
        </span>
        <span className="flex items-center gap-1 text-secondaryText justify-end">
          <Plug size={11} />
          {badges.gunsAvailable}/{badges.gunsTotal} guns free
        </span>
        <span className="text-secondaryText">
          {rerouteDistanceKm > 0 ? `~${Math.round(rerouteDistanceKm)}km detour` : "on route"}
        </span>
        <span className="flex items-center gap-0.5 text-secondaryText justify-end">
          <IndianRupee size={10} />
          {charger.pricePerKwh}/kWh
        </span>
      </div>

      <div className="h-px bg-border" />

      <div className="flex items-center justify-between text-[12px]">
        <span className="text-secondaryText">
          drive {driveLeg.distanceKm}km · {formatDuration(driveLeg.durationMin)}
        </span>
        <span className="text-text font-medium">arrive {chargeLeg.arrivalSocPercent}%</span>
      </div>
      <div className="flex items-center justify-between text-[12px]">
        <span className="flex items-center gap-1 text-secondaryText">
          <Clock size={11} />
          charge {formatDuration(chargeLeg.chargeDurationMin)}
        </span>
        <span className="text-primary font-medium">depart {chargeLeg.departureSocPercent}%</span>
      </div>

      {charger.amenities.length > 0 && (
        <div className="flex items-center gap-2.5 text-secondaryText">
          {charger.amenities.map((a) => {
            const Icon = AMENITY_ICON[a];
            return <Icon key={a} size={13} />;
          })}
        </div>
      )}

      <button
        onClick={() => onSelect(charger.id)}
        className={`mt-1 h-10 rounded-button flex items-center justify-center text-[13px] font-semibold ${
          isRecommended ? "bg-primary text-textOnAction" : "border border-primary text-primary"
        }`}
      >
        select this charger
      </button>
    </div>
  );
}
