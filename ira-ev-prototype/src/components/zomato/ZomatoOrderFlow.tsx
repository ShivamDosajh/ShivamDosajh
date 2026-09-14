import { useEffect, useState } from "react";
import type { ZomatoRestaurant } from "../../types/zomato";
import { ZomatoRestaurantListModal } from "./ZomatoRestaurantListModal";
import { ZomatoOrderModal } from "./ZomatoOrderModal";

interface ZomatoOrderFlowProps {
  open: boolean;
  onClose: () => void;
  stationId: string;
  stationName: string;
  arrivalLabel: string;
  /** Candidate restaurants to choose from — ignored when `fixedRestaurant` is set. */
  restaurants: ZomatoRestaurant[];
  /** Set when the user already picked this exact restaurant (a route-planner stop) — skips the choice step. */
  fixedRestaurant?: ZomatoRestaurant;
  chargerSubtitle?: string;
}

/** Order food -> restaurant choice -> that restaurant's menu, unless a specific restaurant was
 * already picked (e.g. as a trip stop), in which case it goes straight to the menu. */
export function ZomatoOrderFlow({
  open,
  onClose,
  stationId,
  stationName,
  arrivalLabel,
  restaurants,
  fixedRestaurant,
  chargerSubtitle,
}: ZomatoOrderFlowProps) {
  const [selected, setSelected] = useState<ZomatoRestaurant | null>(null);

  useEffect(() => {
    if (open) setSelected(fixedRestaurant ?? null);
  }, [open, fixedRestaurant]);

  if (!open) return null;

  if (!selected) {
    return (
      <ZomatoRestaurantListModal
        open={open}
        onClose={onClose}
        restaurants={restaurants}
        onSelect={setSelected}
        chargerSubtitle={chargerSubtitle}
        stationName={stationName}
      />
    );
  }

  return (
    <ZomatoOrderModal
      open={open}
      onClose={onClose}
      stationId={stationId}
      stationName={stationName}
      restaurant={selected}
      arrivalLabel={arrivalLabel}
      onBack={fixedRestaurant ? undefined : () => setSelected(null)}
    />
  );
}
