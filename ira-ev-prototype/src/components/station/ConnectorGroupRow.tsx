import { PlugZap } from "lucide-react";
import type { ConnectorGroup } from "../../utils/connectors";

export function ConnectorGroupRow({ group }: { group: ConnectorGroup }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
      <div className="flex flex-col items-center w-14 shrink-0">
        <PlugZap size={22} className="text-primary" />
        <span className="text-[11px] text-secondaryText mt-1">{group.power.toFixed(1)} kW</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium">{group.connector}</p>
        <p className="text-[12px] text-secondaryText capitalize">{group.speed}</p>
        <p className="text-[12px] text-secondaryText">₹{group.pricePerKwh.toFixed(2)}/kWh</p>
      </div>
      <div className="text-right text-[12px] shrink-0 leading-relaxed">
        <p className="text-success">available: {group.availableCount}</p>
        <p className="text-secondaryText">in-use: {group.inUseCount}</p>
        <p className="text-secondaryText">unavailable: 0</p>
      </div>
    </div>
  );
}
