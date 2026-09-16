import type { ReactNode } from "react";
import { MapPin, Clock, Zap, IndianRupee } from "lucide-react";
import type { Station } from "../../types/charging";
import { useExperiments } from "../../hooks/useExperiments";
import { PaymentPill } from "./PaymentPill";
import { Button } from "../common/Button";

interface StationCardProps {
  station: Station;
  onSelect: () => void;
}

export function StationCard({ station, onSelect }: StationCardProps) {
  const { config } = useExperiments();
  const maxPower = Math.max(...station.chargers.map((c) => c.power));
  const minPrice = Math.min(...station.chargers.map((c) => c.pricePerKwh));

  if (config.stationCardVariant === "customer") {
    return <CustomerVariant station={station} onSelect={onSelect} maxPower={maxPower} minPrice={minPrice} />;
  }
  if (config.stationCardVariant === "charging") {
    return <ChargingVariant station={station} onSelect={onSelect} maxPower={maxPower} minPrice={minPrice} />;
  }
  return <CurrentVariant station={station} onSelect={onSelect} maxPower={maxPower} />;
}

function CardShell({
  onSelect,
  children,
  compact,
  interactive = true,
}: {
  onSelect: () => void;
  children: ReactNode;
  compact: boolean;
  interactive?: boolean;
}) {
  const className = `text-left bg-surface border border-border rounded-card shrink-0 w-[260px] ${
    compact ? "p-3" : "p-4"
  }`;

  if (interactive) {
    return (
      <button onClick={onSelect} className={`${className} active:opacity-90`}>
        {children}
      </button>
    );
  }

  return <div className={className}>{children}</div>;
}

function CurrentVariant({ station, onSelect, maxPower }: { station: Station; onSelect: () => void; maxPower: number }) {
  const { config } = useExperiments();
  return (
    <CardShell onSelect={onSelect} compact={config.compactStationCards}>
      <p className="font-semibold text-[14px] leading-snug line-clamp-2">{station.name}</p>
      <div className="flex items-center gap-3 mt-2 text-[12px] text-secondaryText">
        <span>{station.distance} km</span>
        <span>{station.eta} min ETA</span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className={`text-[12px] font-medium ${station.available ? "text-success" : "text-secondaryText"}`}>
          {station.available ? "available" : "unavailable"}
        </span>
        <span className="text-[12px] text-secondaryText">{maxPower}kW · {station.chargers[0]?.connector}</span>
      </div>
      {config.showPaymentPill && station.paymentStatus === "enabled" && (
        <div className="mt-2">
          <PaymentPill />
        </div>
      )}
    </CardShell>
  );
}

function CustomerVariant({
  station,
  onSelect,
  maxPower,
  minPrice,
}: {
  station: Station;
  onSelect: () => void;
  maxPower: number;
  minPrice: number;
}) {
  const { config } = useExperiments();
  return (
    <CardShell onSelect={onSelect} compact={config.compactStationCards} interactive={false}>
      <p className="font-semibold text-[14px] leading-snug line-clamp-2">{station.cpo}</p>
      <p className="text-[12px] text-secondaryText mt-0.5">
        {station.distance} km • {station.eta} min
      </p>
      <p className="text-[13px] mt-1.5">
        <span className="text-primary font-medium">{maxPower}kW Fast Charger</span>
      </p>
      <p className={`text-[12px] mt-0.5 font-medium ${station.available ? "text-success" : "text-secondaryText"}`}>
        {station.available ? "Available" : "Unavailable"}
      </p>
      <p className="text-[12px] text-secondaryText mt-0.5">₹{minPrice}/kWh</p>
      {config.showPaymentPill && station.paymentStatus === "enabled" && (
        <div className="mt-1.5">
          <PaymentPill />
        </div>
      )}
      <div className="mt-2.5">
        <Button size="md" onClick={onSelect}>
          Select charger
        </Button>
      </div>
    </CardShell>
  );
}

function ChargingVariant({
  station,
  onSelect,
  maxPower,
  minPrice,
}: {
  station: Station;
  onSelect: () => void;
  maxPower: number;
  minPrice: number;
}) {
  const { config } = useExperiments();
  return (
    <CardShell onSelect={onSelect} compact={config.compactStationCards} interactive={false}>
      <div className="flex items-center gap-1.5 text-primary font-semibold text-[14px]">
        <Zap size={15} />
        {maxPower}kW Fast Charger
      </div>
      <p className={`text-[12px] mt-1 font-medium ${station.available ? "text-success" : "text-secondaryText"}`}>
        {station.available ? "Available" : "Unavailable"}
      </p>
      <div className="flex items-center gap-1 text-[12px] text-secondaryText mt-1.5">
        <MapPin size={12} />
        {station.distance} km away
      </div>
      <div className="flex items-center gap-1 text-[12px] text-secondaryText mt-0.5">
        <Clock size={12} />
        ~{station.eta} min detour
      </div>
      <div className="flex items-center gap-1 text-[12px] text-secondaryText mt-0.5">
        <IndianRupee size={12} />
        {minPrice}/kWh
      </div>
      <div className="mt-2.5">
        <Button size="md" onClick={onSelect}>
          Charge here
        </Button>
      </div>
    </CardShell>
  );
}
