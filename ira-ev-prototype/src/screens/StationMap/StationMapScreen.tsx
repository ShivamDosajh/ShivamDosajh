import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Zap } from "lucide-react";
import { stations } from "../../data/stations";
import { MockMap } from "../../components/map/MockMap";
import { MapControls } from "../../components/map/MapControls";
import { MapLegend } from "../../components/map/MapLegend";
import { FiltersModal, type FilterKey } from "../../components/map/FiltersModal";
import { Chip } from "../../components/common/Chip";
import { StationCard } from "../../components/station/StationCard";
import { ScreenHeader } from "../../components/navigation/ScreenHeader";
import { useExperiments } from "../../hooks/useExperiments";
import type { ChargingFlowApi } from "../../hooks/useChargingFlow";

interface StationMapScreenProps {
  flow: ChargingFlowApi;
}

export function StationMapScreen({ flow }: StationMapScreenProps) {
  const { config } = useExperiments();
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [legendOpen, setLegendOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  const toggleFilter = (key: FilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const matches =
          station.name.toLowerCase().includes(q) ||
          station.address.toLowerCase().includes(q) ||
          station.cpo.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (activeFilters.has("megaCharger") && !station.isMegaCharger) return false;
      if (activeFilters.has("available") && !station.available) return false;
      if (activeFilters.has("fast") && !station.chargers.some((c) => c.speed !== "slow")) return false;
      if (activeFilters.has("paymentEnabled") && station.paymentStatus !== "enabled") return false;
      return true;
    });
  }, [query, activeFilters]);

  return (
    <div className="flex flex-col h-full relative">
      <ScreenHeader title="stations" onBack={() => {}} />
      <div className="relative flex-1 min-h-0">
        <MockMap
          stations={filteredStations}
          selectedStationId={flow.selectedStationId}
          onSelectStation={(id) => flow.selectStation(id)}
          key={mapKey}
        />

        <div className="absolute inset-x-0 top-0 px-4 pt-3 flex flex-col gap-2.5 z-10">
          <div className="flex items-center gap-2 bg-black/85 backdrop-blur rounded-button h-12 px-3.5 shadow-lg">
            <Search size={18} className="text-secondaryText shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search for location, station"
              className="bg-transparent outline-none border-none text-white placeholder:text-secondaryText w-full text-[15px]"
              inputMode="search"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-pill bg-black/85 backdrop-blur text-white text-[13px] font-medium shrink-0 border border-white/10"
            >
              <SlidersHorizontal size={14} />
              filters
            </button>
            <Chip active={activeFilters.has("megaCharger")} onClick={() => toggleFilter("megaCharger")}>
              TATA.ev Mega Charger
            </Chip>
            <Chip active={activeFilters.has("available")} onClick={() => toggleFilter("available")}>
              available
            </Chip>
            <Chip
              active={activeFilters.has("fast")}
              onClick={() => toggleFilter("fast")}
              icon={<Zap size={13} />}
            >
              fast
            </Chip>
          </div>
        </div>

        <MapControls
          onVehicle={() => {}}
          onLocate={() => setMapKey((k) => k + 1)}
          onLegend={() => setLegendOpen(true)}
          onRefresh={() => setMapKey((k) => k + 1)}
        />

        {config.showStationCarousel && !flow.selectedStationId && filteredStations.length > 0 && (
          <div className="absolute inset-x-0 bottom-4 z-10">
            <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
              {filteredStations.map((station) => (
                <StationCard key={station.id} station={station} onSelect={() => flow.selectStation(station.id)} />
              ))}
            </div>
          </div>
        )}

        {filteredStations.length === 0 && (
          <div className="absolute inset-x-0 bottom-24 flex justify-center z-10">
            <p className="bg-black/85 text-white text-[13px] px-4 py-2 rounded-pill">
              no stations match your search
            </p>
          </div>
        )}
      </div>

      <MapLegend open={legendOpen} onClose={() => setLegendOpen(false)} />
      <FiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        active={activeFilters}
        onToggle={toggleFilter}
        onClearAll={() => setActiveFilters(new Set())}
      />
    </div>
  );
}
