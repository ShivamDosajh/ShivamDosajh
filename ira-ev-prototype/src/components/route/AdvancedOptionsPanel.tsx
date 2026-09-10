import { useState } from "react";
import { ChevronDown, ChevronUp, Zap, Wind, Route as RouteIcon, TrafficCone, Ban } from "lucide-react";
import { Chip } from "../common/Chip";
import { SegmentedControl } from "../common/SegmentedControl";
import { Toggle } from "../common/Toggle";
import type { ChargeStopStrategy, DrivingStyle, RoutePreferences, TrafficLevel } from "../../types/route";

interface AdvancedOptionsPanelProps {
  preferences: RoutePreferences;
  onChange: (partial: Partial<RoutePreferences>) => void;
}

const CONNECTOR_OPTIONS = ["CCS2", "Type 2"];
const NETWORK_OPTIONS = ["Tata Power", "Statiq", "Ather Grid", "ChargeZone"];
const POWER_OPTIONS: { label: string; value: number }[] = [
  { label: "any power", value: 0 },
  { label: "25kW+", value: 25 },
  { label: "50kW+", value: 50 },
  { label: "90kW+", value: 90 },
];
const DRIVING_STYLE_OPTIONS: { value: DrivingStyle; label: string }[] = [
  { value: "eco", label: "eco" },
  { value: "normal", label: "normal" },
  { value: "spirited", label: "spirited" },
];
const TRAFFIC_OPTIONS: { value: TrafficLevel; label: string }[] = [
  { value: "light", label: "light" },
  { value: "moderate", label: "moderate" },
  { value: "heavy", label: "heavy" },
];
const CHARGE_STRATEGY_OPTIONS: { value: ChargeStopStrategy; label: string }[] = [
  { value: "optimal", label: "optimal" },
  { value: "fewer", label: "fewer stops" },
  { value: "fewest", label: "fewest stops" },
];

function toggleInArray(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function AdvancedOptionsPanel({ preferences, onChange }: AdvancedOptionsPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-card bg-surfaceRaised border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3.5 py-3 min-h-[44px]"
      >
        <span className="text-[14px] font-medium text-text">advanced options</span>
        {open ? (
          <ChevronUp size={16} className="text-secondaryText" />
        ) : (
          <ChevronDown size={16} className="text-secondaryText" />
        )}
      </button>

      {open && (
        <div className="px-3.5 pb-4 flex flex-col gap-4 border-t border-border pt-4">
          <div>
            <p className="text-[12px] text-secondaryText mb-2 lowercase">preferred connector</p>
            <div className="flex gap-2 flex-wrap">
              {CONNECTOR_OPTIONS.map((c) => (
                <Chip
                  key={c}
                  active={preferences.preferredConnectors.includes(c)}
                  onClick={() => onChange({ preferredConnectors: toggleInArray(preferences.preferredConnectors, c) })}
                >
                  {c}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[12px] text-secondaryText mb-2 lowercase">preferred network</p>
            <div className="flex gap-2 flex-wrap">
              {NETWORK_OPTIONS.map((n) => (
                <Chip
                  key={n}
                  active={preferences.preferredNetworks.includes(n)}
                  onClick={() => onChange({ preferredNetworks: toggleInArray(preferences.preferredNetworks, n) })}
                >
                  {n}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[12px] text-secondaryText mb-2 lowercase">minimum charger power</p>
            <div className="flex gap-2 flex-wrap">
              {POWER_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  active={preferences.minChargerPowerKw === opt.value}
                  onClick={() => onChange({ minChargerPowerKw: opt.value })}
                  icon={<Zap size={12} />}
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[12px] text-secondaryText mb-2 lowercase">driving style</p>
            <SegmentedControl
              options={DRIVING_STYLE_OPTIONS}
              value={preferences.drivingStyle}
              onChange={(v) => onChange({ drivingStyle: v })}
            />
          </div>

          <div>
            <p className="text-[12px] text-secondaryText mb-2 lowercase">charging strategy</p>
            <SegmentedControl
              options={CHARGE_STRATEGY_OPTIONS}
              value={preferences.chargeStopStrategy}
              onChange={(v) => onChange({ chargeStopStrategy: v })}
            />
            <p className="text-[11px] text-secondaryText mt-1.5">
              optimal balances stop count against charging time · fewer/fewest stops charge closer to full each
              time to skip stations
            </p>
          </div>

          <div>
            <p className="text-[12px] text-secondaryText mb-2 lowercase flex items-center gap-1.5">
              <TrafficCone size={12} />
              expected traffic
            </p>
            <SegmentedControl
              options={TRAFFIC_OPTIONS}
              value={preferences.trafficLevel}
              onChange={(v) => onChange({ trafficLevel: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[14px] text-text">
              <Ban size={15} className="text-secondaryText" />
              avoid tolls
            </span>
            <Toggle checked={preferences.avoidTolls} onChange={(v) => onChange({ avoidTolls: v })} label="avoid tolls" />
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[14px] text-text">
              <Wind size={15} className="text-secondaryText" />
              climate control running
            </span>
            <Toggle
              checked={preferences.climateControlOn}
              onChange={(v) => onChange({ climateControlOn: v })}
              label="climate control running"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[14px] text-text">
              <RouteIcon size={15} className="text-secondaryText" />
              avoid highways
            </span>
            <Toggle
              checked={preferences.avoidHighways}
              onChange={(v) => onChange({ avoidHighways: v })}
              label="avoid highways"
            />
          </div>
        </div>
      )}
    </div>
  );
}
