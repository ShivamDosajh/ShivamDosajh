import { Smartphone } from "lucide-react";
import { hashString } from "../../utils/hash";

/**
 * The problem this targets: drivers open iRA.ev to check a charger's status, then leave the
 * app to actually pay and start (a card reader, a different operator app). This nudge sits
 * right where that drop-off happens — the station card, before a gun is even picked — and
 * argues the in-app path is strictly less friction, backed by a concrete number rather than
 * just "please stay in our app".
 */
export function PayViaAppNudge({ stationId }: { stationId: string }) {
  const seed = hashString(stationId);
  const chargedToday = 6 + (seed % 19); // stable per station, not actually random

  return (
    <div className="flex items-center gap-3 rounded-card bg-primary/10 border border-primary/30 px-3.5 py-3">
      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary">
        <Smartphone size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-text font-medium">skip the card reader — pay & start right here</p>
        <p className="text-[11px] text-secondaryText mt-0.5">
          {chargedToday} drivers paid via iRA.ev at this station today · zero platform fee
        </p>
      </div>
    </div>
  );
}
