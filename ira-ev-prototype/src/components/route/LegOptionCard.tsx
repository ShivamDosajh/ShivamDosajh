import { ChevronRight, IndianRupee, Star } from "lucide-react";
import type { LegChargerOption } from "../../types/legByLeg";
import { formatDuration } from "../../utils/routePlanner";

interface LegOptionCardProps {
  option: LegChargerOption;
  /** Opens the full charger-detail sheet — that's where selecting actually happens now, so the
   * driver sees everything (photos, rating, amenities, full drive/charge breakdown) before
   * committing rather than picking off this summary card alone. */
  onOpenDetail: (option: LegChargerOption) => void;
}

/** One charger option for the leg currently being decided — the recommended pick or a
 * nearby backup, each shown with a preview of the drive-there-and-charge it implies. Tapping
 * it opens the full detail sheet rather than selecting immediately. */
export function LegOptionCard({ option, onOpenDetail }: LegOptionCardProps) {
  const { charger, isRecommended, rerouteDistanceKm, driveLeg, chargeLeg } = option;

  return (
    <button
      onClick={() => onOpenDetail(option)}
      className={`w-full text-left rounded-card border px-3.5 py-3 ${
        isRecommended ? "border-primary bg-primary/10" : "border-border bg-surfaceRaised"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {isRecommended ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/15 px-1.5 py-0.5 rounded-pill mb-1">
              <Star size={9} className="fill-primary" />
              recommended
            </span>
          ) : (
            <span className="inline-block text-[10px] font-medium text-warning bg-warning/15 px-1.5 py-0.5 rounded-pill mb-1">
              ~{Math.round(rerouteDistanceKm)}km reroute
            </span>
          )}
          <p className="text-[12px] text-secondaryText">{charger.cpo}</p>
          <p className="text-[14px] font-medium truncate">{charger.name}</p>
        </div>
        <span className="text-[11px] text-secondaryText shrink-0 text-right">
          {charger.connector}
          <br />
          {charger.powerKw}kW
        </span>
      </div>

      <div className="h-px bg-border my-2" />

      <div className="flex items-center justify-between text-[12px]">
        <span className="text-secondaryText">
          drive {driveLeg.distanceKm}km · {formatDuration(driveLeg.durationMin)}
        </span>
        <span className="text-text font-medium">
          SoC {driveLeg.socStart}% → {chargeLeg.departureSocPercent}%
        </span>
      </div>
      <div className="flex items-center justify-between mt-1 text-[12px]">
        <span className="text-secondaryText">
          charge {formatDuration(chargeLeg.chargeDurationMin)} · +{chargeLeg.energyAddedKwh}kWh
        </span>
        <span className="flex items-center gap-0.5 text-primary font-medium">
          <IndianRupee size={11} />
          {chargeLeg.costEstimate}
        </span>
      </div>

      <div
        className={`mt-2.5 h-9 rounded-button flex items-center justify-center gap-1 text-[12px] font-semibold ${
          isRecommended ? "bg-primary text-black" : "border border-primary text-primary"
        }`}
      >
        view details &amp; select
        <ChevronRight size={13} />
      </div>
    </button>
  );
}
