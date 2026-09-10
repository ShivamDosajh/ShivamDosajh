import { useState } from "react";
import { Search, MapPin, UtensilsCrossed, Wifi, Bath, Zap } from "lucide-react";
import { Modal } from "../common/Modal";
import { searchStopPoints } from "../../data/routeStops";
import { getChargerById } from "../../data/routeChargers";
import type { Amenity } from "../../types/route";

interface StopPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (ref: string) => void;
  excludeRefs?: string[];
}

const AMENITY_ICON: Record<Amenity, typeof UtensilsCrossed> = {
  food: UtensilsCrossed,
  restroom: Bath,
  wifi: Wifi,
};

export function StopPickerModal({ open, onClose, onSelect, excludeRefs = [] }: StopPickerModalProps) {
  const [query, setQuery] = useState("");
  const results = searchStopPoints(query, excludeRefs);

  return (
    <Modal open={open} onClose={onClose} title="Add a stop">
      <div className="flex items-center gap-2 bg-surfaceRaised border border-border rounded-button h-11 px-3 mb-3 -mt-1">
        <Search size={16} className="text-secondaryText shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search a city, or a restaurant with charging"
          className="bg-transparent outline-none border-none text-text placeholder:text-secondaryText w-full text-[14px]"
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-1">
        {results.map((stop) => {
          const charger = stop.kind === "charger-amenity" ? getChargerById(stop.ref.slice("charger:".length)) : undefined;
          return (
            <button
              key={stop.ref}
              onClick={() => {
                onSelect(stop.ref);
                onClose();
                setQuery("");
              }}
              className="flex items-center gap-3 px-2 py-3 rounded-button min-h-[44px] active:bg-surfaceRaised text-left"
            >
              <div
                className={[
                  "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                  stop.kind === "charger-amenity" ? "bg-primary/15" : "bg-surfaceRaised",
                ].join(" ")}
              >
                {stop.kind === "charger-amenity" ? (
                  <Zap size={16} className="text-primary" />
                ) : (
                  <MapPin size={16} className="text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-text font-medium truncate">{stop.label}</p>
                <p className="text-[12px] text-secondaryText truncate">{stop.subtitle}</p>
              </div>
              {charger && charger.amenities.length > 0 && (
                <div className="flex items-center gap-1 shrink-0">
                  {charger.amenities.map((a) => {
                    const Icon = AMENITY_ICON[a];
                    return (
                      <div key={a} className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-secondaryText">
                        <Icon size={11} />
                      </div>
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
        {results.length === 0 && (
          <p className="text-[13px] text-secondaryText text-center py-6">no matching stops</p>
        )}
      </div>
    </Modal>
  );
}
