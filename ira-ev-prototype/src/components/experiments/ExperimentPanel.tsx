import { FlaskConical, RotateCcw } from "lucide-react";
import { Modal } from "../common/Modal";
import { Toggle } from "../common/Toggle";
import { useExperiments } from "../../hooks/useExperiments";
import type { ExperimentConfig, StationCardVariant } from "../../types/charging";

interface ExperimentPanelProps {
  onResetPrototype: () => void;
}

const toggleDefs: { key: keyof ExperimentConfig; label: string }[] = [
  { key: "showPaymentPill", label: "Payment pill on station card" },
  { key: "showRangePrediction", label: "Range prediction" },
  { key: "showEstimatedCost", label: "Estimated charging cost" },
  { key: "showMegaChargerBadge", label: "Mega Charger badge" },
  { key: "showStationLastUsed", label: "Last-used information" },
  { key: "showAvailability", label: "Availability indicator" },
  { key: "showStationCarousel", label: "Station carousel on map" },
  { key: "compactStationCards", label: "Compact station cards" },
  { key: "stickyCTA", label: "Sticky CTA" },
  { key: "simplifiedChargingFlow", label: "Simplified charging flow" },
];

const variantOptions: { value: StationCardVariant; label: string }[] = [
  { value: "current", label: "Current" },
  { value: "customer", label: "Customer-oriented" },
  { value: "charging", label: "Charging-oriented" },
];

export function ExperimentPanel({ onResetPrototype }: ExperimentPanelProps) {
  const { config, setConfig, panelOpen, closePanel, resetConfig } = useExperiments();

  return (
    <Modal open={panelOpen} onClose={closePanel} title="UX Experiments">
      <div className="flex items-center gap-2 text-primary mb-4">
        <FlaskConical size={16} />
        <p className="text-[12px]">Not visible to end users. Long-press the header to reopen.</p>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {toggleDefs.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <span className="text-text text-[14px] flex-1 min-w-0 pr-2">{label}</span>
            <Toggle
              checked={Boolean(config[key])}
              onChange={(value) => setConfig({ [key]: value } as Partial<ExperimentConfig>)}
              label={label}
            />
          </div>
        ))}
      </div>

      <p className="text-text text-[14px] font-medium mb-3">Station Card variant</p>
      <div className="flex flex-col gap-2 mb-6">
        {variantOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setConfig({ stationCardVariant: opt.value })}
            className={`flex items-center gap-3 rounded-card border px-4 py-3 min-h-[44px] text-left ${
              config.stationCardVariant === opt.value ? "border-primary bg-primary/10" : "border-border bg-surfaceRaised"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                config.stationCardVariant === opt.value ? "border-primary bg-primary" : "border-secondaryText"
              }`}
            />
            <span className="text-[14px] text-text">{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 pb-2">
        <button
          onClick={() => {
            resetConfig();
          }}
          className="text-secondaryText text-[13px] text-left"
        >
          reset experiment settings to default
        </button>
        <button
          onClick={() => {
            onResetPrototype();
            closePanel();
          }}
          className="flex items-center gap-2 justify-center h-11 rounded-button border border-error text-error text-[14px] font-medium mt-2"
        >
          <RotateCcw size={15} />
          Reset Prototype
        </button>
      </div>
    </Modal>
  );
}
