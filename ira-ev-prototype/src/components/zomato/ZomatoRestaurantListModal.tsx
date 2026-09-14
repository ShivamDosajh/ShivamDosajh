import { Star, Zap, UtensilsCrossed } from "lucide-react";
import { Modal } from "../common/Modal";
import type { ZomatoRestaurant } from "../../types/zomato";

interface ZomatoRestaurantListModalProps {
  open: boolean;
  onClose: () => void;
  restaurants: ZomatoRestaurant[];
  onSelect: (restaurant: ZomatoRestaurant) => void;
  /** e.g. "Tata Power · CCS2 · 90kW" — shown once at the top so it's clear which charger these restaurants sit near. */
  chargerSubtitle?: string;
  stationName: string;
}

export function ZomatoRestaurantListModal({
  open,
  onClose,
  restaurants,
  onSelect,
  chargerSubtitle,
  stationName,
}: ZomatoRestaurantListModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Nearby restaurants">
      <div className="flex items-start gap-2.5 rounded-card bg-primary/10 border border-primary/30 px-3 py-2.5 mb-3">
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary">
          <Zap size={13} />
        </div>
        <div className="min-w-0">
          <p className="text-[12px] text-text font-medium">{stationName}</p>
          {chargerSubtitle && <p className="text-[11px] text-secondaryText mt-0.5">{chargerSubtitle}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {restaurants.map((restaurant) => (
          <button
            key={restaurant.id}
            onClick={() => onSelect(restaurant)}
            className="flex items-center gap-3 rounded-card bg-surfaceRaised border border-border px-3.5 py-3 min-h-[44px] text-left active:border-primary"
          >
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary">
              <UtensilsCrossed size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-text font-medium truncate">{restaurant.name}</p>
              <p className="text-[12px] text-secondaryText truncate">{restaurant.cuisine}</p>
            </div>
            <span className="flex items-center gap-1 text-[12px] text-warning shrink-0">
              <Star size={12} className="fill-warning" />
              {restaurant.rating.toFixed(1)}
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
