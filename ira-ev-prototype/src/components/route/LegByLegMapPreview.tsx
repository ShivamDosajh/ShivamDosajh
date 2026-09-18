import { Navigation, Flag, Zap, Check } from "lucide-react";
import { MockMapBackground } from "../map/MockMapBackground";
import type { RouteLeg } from "../../types/route";
import type { ActiveLeg } from "../../types/legByLeg";

interface Coordinates {
  x: number;
  y: number;
}

interface LegByLegMapPreviewProps {
  startCoordinates: Coordinates;
  destinationCoordinates: Coordinates;
  confirmedLegs: RouteLeg[];
  activeLeg: ActiveLeg | null;
}

/**
 * Unlike the auto-planner's map (the whole route is known up front), this only ever draws
 * what's actually decided: a solid checked path through confirmed stops, then the leg
 * currently being chosen as a dashed line out to the recommended charger, with backup
 * options shown as nearby unconnected pins — "here's the plan so far, and here's what
 * you're picking between right now."
 */
export function LegByLegMapPreview({ startCoordinates, destinationCoordinates, confirmedLegs, activeLeg }: LegByLegMapPreviewProps) {
  const confirmedChargerPoints = confirmedLegs
    .filter((l): l is Extract<RouteLeg, { kind: "charge" }> => l.kind === "charge")
    .map((l) => l.charger.coordinates);

  const solidPathPoints = [startCoordinates, ...confirmedChargerPoints];
  const currentPoint = solidPathPoints[solidPathPoints.length - 1];
  const solidPathD = solidPathPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const recommendedOption = activeLeg?.kind === "charge-choice" ? activeLeg.leg.options.find((o) => o.isRecommended) : undefined;
  const backupOptions = activeLeg?.kind === "charge-choice" ? activeLeg.leg.options.filter((o) => !o.isRecommended) : [];

  const dashedTarget =
    activeLeg?.kind === "charge-choice" && recommendedOption
      ? recommendedOption.charger.coordinates
      : activeLeg?.kind === "final"
      ? destinationCoordinates
      : null;
  const dashedPathD = dashedTarget ? `M ${currentPoint.x} ${currentPoint.y} L ${dashedTarget.x} ${dashedTarget.y}` : null;

  return (
    <div className="relative w-full h-56 rounded-card overflow-hidden border border-border">
      <MockMapBackground />
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <path d={solidPathD} fill="none" stroke="#0a8f7e" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        {dashedPathD && (
          <path
            d={dashedPathD}
            fill="none"
            stroke="#0fbfa8"
            strokeWidth="0.7"
            strokeDasharray="2.2 1.6"
            vectorEffect="non-scaling-stroke"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Start pin */}
      <div
        style={{ left: `${startCoordinates.x}%`, top: `${startCoordinates.y}%` }}
        className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <div className="w-7 h-7 rounded-full bg-black border-2 border-white flex items-center justify-center shadow">
          <Navigation size={12} className="text-white" fill="white" />
        </div>
      </div>

      {/* Destination pin — always visible so the driver keeps a sense of where they're headed. */}
      <div
        style={{ left: `${destinationCoordinates.x}%`, top: `${destinationCoordinates.y}%` }}
        className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <div className="w-7 h-7 rounded-full bg-error border-2 border-white flex items-center justify-center shadow">
          <Flag size={12} className="text-white" fill="white" />
        </div>
      </div>

      {/* Confirmed (done) charger stops */}
      {confirmedChargerPoints.map((p, i) => (
        <div key={i} style={{ left: `${p.x}%`, top: `${p.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-6 h-6 rounded-full bg-primary border-2 border-white flex items-center justify-center shadow">
            <Check size={12} className="text-black" strokeWidth={3} />
          </div>
        </div>
      ))}

      {/* Backup candidates for the leg being decided right now */}
      {backupOptions.map((opt) => (
        <div
          key={opt.charger.id}
          style={{ left: `${opt.charger.coordinates.x}%`, top: `${opt.charger.coordinates.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
        >
          <div className="w-5 h-5 rounded-full bg-background border-2 border-warning flex items-center justify-center shadow">
            <Zap size={10} className="text-warning" />
          </div>
        </div>
      ))}

      {/* The recommended candidate — highlighted so it reads as "the leg you're deciding." */}
      {recommendedOption && (
        <div
          style={{ left: `${recommendedOption.charger.coordinates.x}%`, top: `${recommendedOption.charger.coordinates.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute w-9 h-9 rounded-full bg-primary/30 animate-ping" />
            <div className="relative w-7 h-7 rounded-full bg-primary border-2 border-white flex items-center justify-center shadow">
              <Zap size={13} className="text-black" fill="black" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
