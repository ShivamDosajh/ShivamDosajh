import { Battery, IndianRupee, Clock, BatteryCharging } from "lucide-react";
import {
  amountFromUnits,
  unitsFromAmount,
  estimateChargeDurationMin,
  unitsForTargetSoc,
  socForUnits,
  formatCurrency,
  formatUnits,
} from "../../utils/pricing";
import { formatDuration } from "../../utils/routePlanner";
import { myConnectedVehicle } from "../../data/vehicles";
import type { Charger } from "../../types/charging";

const UNITS_SLIDER_MAX = 75;

interface LinkedChargeSlidersProps {
  charger: Charger;
  units: number;
  isFullCharge: boolean;
  fullChargeUnits: number;
  onChangeUnits: (units: number) => void;
  onToggleFullCharge: (checked: boolean) => void;
}

const sliderStyle = { accentColor: "#0fbfa8" };
const sliderClassName = "w-full h-2 rounded-pill bg-surfaceRaised accent-primary min-h-[28px]";

/**
 * A "full charge" checkbox plus three interlinked sliders (units, cost, target SoC%) —
 * dragging any one recomputes the others from the charger's price/kWh and the connected
 * vehicle's battery capacity, so they always agree, and ticking "full charge" sets them all
 * directly rather than requiring a drag. Every slider derives its display from the same
 * `units` value the parent owns, so there's a single source of truth instead of the numbers
 * drifting apart from independent rounding.
 */
export function LinkedChargeSliders({
  charger,
  units,
  isFullCharge,
  fullChargeUnits,
  onChangeUnits,
  onToggleFullCharge,
}: LinkedChargeSlidersProps) {
  const amount = amountFromUnits(units, charger.pricePerKwh);
  const costSliderMax = amountFromUnits(UNITS_SLIDER_MAX, charger.pricePerKwh);
  const durationMin = estimateChargeDurationMin(units, charger.power);

  return (
    <div className="flex flex-col gap-5">
      <label className="flex items-center gap-3 rounded-card bg-surfaceRaised border border-border px-4 py-3 min-h-[44px]">
        <input
          type="checkbox"
          checked={isFullCharge}
          onChange={(e) => onToggleFullCharge(e.target.checked)}
          className="w-5 h-5 accent-primary shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] text-text font-medium">full charge</p>
          <p className="text-[12px] text-secondaryText">
            {formatUnits(fullChargeUnits)} · {formatCurrency(amountFromUnits(fullChargeUnits, charger.pricePerKwh))}
          </p>
        </div>
      </label>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[14px] text-text">
            <Battery size={15} className="text-secondaryText" />
            units
          </span>
          <span className="text-[14px] font-semibold text-primary">{formatUnits(units)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={UNITS_SLIDER_MAX}
          step={0.5}
          value={units}
          onChange={(e) => onChangeUnits(Number(e.target.value))}
          className={sliderClassName}
          style={sliderStyle}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[14px] text-text">
            <IndianRupee size={15} className="text-secondaryText" />
            cost
          </span>
          <span className="text-[14px] font-semibold text-primary">{formatCurrency(amount)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={costSliderMax}
          step={Math.max(1, costSliderMax / 150)}
          value={amount}
          onChange={(e) => onChangeUnits(unitsFromAmount(Number(e.target.value), charger.pricePerKwh))}
          className={sliderClassName}
          style={sliderStyle}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[14px] text-text">
            <BatteryCharging size={15} className="text-secondaryText" />
            charge to
          </span>
          <span className="text-[14px] font-semibold text-primary">{Math.round(socForUnits(units))}%</span>
        </div>
        <input
          type="range"
          min={Math.ceil(myConnectedVehicle.currentSocPercent)}
          max={100}
          step={1}
          value={Math.round(socForUnits(units))}
          onChange={(e) => onChangeUnits(unitsForTargetSoc(Number(e.target.value)))}
          className={sliderClassName}
          style={sliderStyle}
        />
        <p className="text-[11px] text-secondaryText">current battery: {myConnectedVehicle.currentSocPercent}%</p>
      </div>

      <div className="rounded-card bg-surfaceRaised border border-border px-4 py-3 flex items-center gap-2.5">
        <Clock size={16} className="text-primary shrink-0" />
        <div>
          <p className="text-[12px] text-secondaryText lowercase">estimated charging time</p>
          <p className="text-[14px] font-semibold mt-0.5">{units > 0 ? formatDuration(durationMin) : "--"}</p>
        </div>
      </div>
    </div>
  );
}
