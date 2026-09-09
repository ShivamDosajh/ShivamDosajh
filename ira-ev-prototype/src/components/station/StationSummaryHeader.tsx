import type { Station } from "../../types/charging";
import { CpoLogo } from "../common/CpoLogo";

export function StationSummaryHeader({ station }: { station: Station }) {
  return (
    <div className="flex items-start justify-between gap-3 py-4">
      <div className="min-w-0">
        <p className="text-[13px] text-secondaryText">{station.cpo}</p>
        <h2 className="text-[18px] font-semibold leading-snug mt-0.5">{station.name}</h2>
        <p className="text-[13px] text-secondaryText mt-1 leading-relaxed">{station.address}</p>
      </div>
      <CpoLogo cpo={station.cpo} />
    </div>
  );
}
