import { useState } from "react";
import { ChevronDown, ChevronUp, Zap, Wind, Route as RouteIcon, IndianRupee, Timer, Milestone, Utensils } from "lucide-react";
import { Chip } from "../common/Chip";
import { SegmentedControl } from "../common/SegmentedControl";
import { Toggle } from "../common/Toggle";
import type { ChargeStopStrategy, DrivingStyle, RoutePreferences } from "../../types/route";

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
const CHARGE_STRATEGY_OPTIONS: {
  value: ChargeStopStrategy;
  label: string;
  description: string;
  icon: typeof IndianRupee;
}[] = [
  { value: "cheapest", label: "cheapest", description: "lowest cost chargers, even if a few extra stops", icon: IndianRupee },
  { value: "fastest", label: "fastest", description: "highest-power chargers, quick top-ups", icon: Timer },
  { value: "fewest-stops", label: "fewest stops", description: "charge closer to full each time to skip stations", icon: Milestone },
  { value: "amenities", label: "amenities trip", description: "stop near food around your meal times", icon: Utensils },
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
            <div className="grid grid-cols-2 gap-2">
              {CHARGE_STRATEGY_OPTIONS.map((opt) => {
                const active = preferences.chargeStopStrategy === opt.value;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onChange({ chargeStopStrategy: opt.value })}
                    className={`text-left rounded-button border px-3 py-2.5 flex flex-col gap-1 transition-colors ${
                      active ? "border-primary bg-primary/10" : "border-border bg-background"
                    }`}
                  >
                    <span className={`flex items-center gap-1.5 text-[13px] font-medium ${active ? "text-primary" : "text-text"}`}>
                      <Icon size={14} />
                      {opt.label}
                    </span>
                    <span className="text-[11px] text-secondaryText leading-snug">{opt.description}</span>
                  </button>
                );
              })}
            </div>

            {preferences.chargeStopStrategy === "amenities" && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] text-secondaryText lowercase">lunch</span>
                  <input
                    type="time"
                    value={preferences.lunchTime}
                    onChange={(e) => onChange({ lunchTime: e.target.value })}
                    className="h-9 rounded-button bg-background border border-border px-2 text-[13px] outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] text-secondaryText lowercase">snack</span>
                  <input
                    type="time"
                    value={preferences.snackTime}
                    onChange={(e) => onChange({ snackTime: e.target.value })}
                    className="h-9 rounded-button bg-background border border-border px-2 text-[13px] outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] text-secondaryText lowercase">dinner</span>
                  <input
                    type="time"
                    value={preferences.dinnerTime}
                    onChange={(e) => onChange({ dinnerTime: e.target.value })}
                    className="h-9 rounded-button bg-background border border-border px-2 text-[13px] outline-none"
                  />
                </label>
              </div>
            )}
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
              avoid highways &amp; tolls
            </span>
            <Toggle
              checked={preferences.avoidHighways}
              onChange={(v) => onChange({ avoidHighways: v })}
              label="avoid highways and tolls"
            />
          </div>
        </div>
      )}
    </div>
  );
}
