import { useState } from "react";
import { Search, MapPin, UtensilsCrossed, Zap, Star } from "lucide-react";
import { Modal } from "../common/Modal";
import { searchStopPoints } from "../../data/routeStops";
import { getRestaurantById, getChargerForRestaurant } from "../../data/restaurants";

interface StopPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (ref: string) => void;
  excludeRefs?: string[];
}

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
          placeholder="search a city, or a restaurant to eat at"
          className="bg-transparent outline-none border-none text-text placeholder:text-secondaryText w-full text-[14px]"
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-1">
        {results.map((stop) => {
          const restaurant = stop.kind === "restaurant" ? getRestaurantById(stop.ref.slice("food:".length)) : undefined;
          const charger = restaurant ? getChargerForRestaurant(restaurant) : undefined;
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
                  stop.kind === "restaurant" ? "bg-primary/15" : "bg-surfaceRaised",
                ].join(" ")}
              >
                {stop.kind === "restaurant" ? (
                  <UtensilsCrossed size={16} className="text-primary" />
                ) : (
                  <MapPin size={16} className="text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-text font-medium truncate">{stop.label}</p>
                {restaurant ? (
                  <p className="text-[12px] text-secondaryText truncate flex items-center gap-1">
                    {restaurant.cuisine}
                    <span className="flex items-center gap-0.5 text-warning shrink-0">
                      <Star size={10} className="fill-warning" />
                      {restaurant.rating.toFixed(1)}
                    </span>
                  </p>
                ) : (
                  <p className="text-[12px] text-secondaryText truncate">{stop.subtitle}</p>
                )}
              </div>
              {charger && (
                <div className="flex items-center gap-1 shrink-0 text-[11px] text-primary bg-primary/10 rounded-pill px-2 py-1">
                  <Zap size={11} />
                  {charger.powerKw}kW
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
