import { useState } from "react";
import { Minus, Plus, Star, ShoppingBag } from "lucide-react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { useZomatoOrder } from "../../hooks/useZomatoOrder";
import type { CartLine, MenuItem, ZomatoRestaurant } from "../../types/zomato";

interface ZomatoOrderModalProps {
  open: boolean;
  onClose: () => void;
  stationId: string;
  stationName: string;
  restaurant: ZomatoRestaurant;
  /** How arrival is described to the user — "~5 min" near a station, or an ETA clock time on a planned trip. */
  arrivalLabel: string;
}

export function ZomatoOrderModal({ open, onClose, stationId, stationName, restaurant, arrivalLabel }: ZomatoOrderModalProps) {
  const { placeOrder } = useZomatoOrder();
  const [qtyByItem, setQtyByItem] = useState<Record<string, number>>({});

  const setQty = (item: MenuItem, qty: number) => {
    setQtyByItem((prev) => ({ ...prev, [item.id]: Math.max(0, qty) }));
  };

  const lines: CartLine[] = restaurant.menu
    .filter((item) => (qtyByItem[item.id] ?? 0) > 0)
    .map((item) => ({ item, qty: qtyByItem[item.id] }));
  const totalPrice = lines.reduce((sum, l) => sum + l.item.price * l.qty, 0);
  const totalItems = lines.reduce((sum, l) => sum + l.qty, 0);

  const categories = Array.from(new Set(restaurant.menu.map((m) => m.category)));

  const handlePlaceOrder = () => {
    if (lines.length === 0) return;
    placeOrder(stationId, stationName, restaurant, lines, arrivalLabel);
    setQtyByItem({});
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Order food">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[15px] font-semibold text-text">{restaurant.name}</p>
          <p className="text-[12px] text-secondaryText">{restaurant.cuisine}</p>
        </div>
        <span className="flex items-center gap-1 text-[12px] text-warning shrink-0">
          <Star size={12} className="fill-warning" />
          {restaurant.rating.toFixed(1)}
        </span>
      </div>
      <p className="text-[11px] text-primary bg-primary/10 rounded-button px-2.5 py-2 mt-2 mb-3">
        order now — it'll be ready and delivered to your charging bay at {stationName}, right as you arrive (
        {arrivalLabel})
      </p>

      <div className="flex flex-col gap-4">
        {categories.map((category) => (
          <div key={category}>
            <p className="text-[11px] text-secondaryText uppercase tracking-wide mb-1.5">{category}</p>
            <div className="flex flex-col gap-2">
              {restaurant.menu
                .filter((item) => item.category === category)
                .map((item) => {
                  const qty = qtyByItem[item.id] ?? 0;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-card bg-surfaceRaised border border-border px-3 py-2.5"
                    >
                      <div
                        className={`w-3.5 h-3.5 border shrink-0 flex items-center justify-center ${
                          item.veg ? "border-success" : "border-error"
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${item.veg ? "bg-success" : "bg-error"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-text truncate">{item.name}</p>
                        <p className="text-[12px] text-secondaryText">₹{item.price}</p>
                      </div>
                      {qty === 0 ? (
                        <button
                          onClick={() => setQty(item, 1)}
                          className="h-8 px-3 rounded-button border border-primary text-primary text-[12px] font-medium shrink-0"
                        >
                          add
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 rounded-button border border-primary shrink-0">
                          <button
                            onClick={() => setQty(item, qty - 1)}
                            aria-label={`Remove one ${item.name}`}
                            className="w-8 h-8 flex items-center justify-center text-primary"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="text-[13px] font-medium text-text w-3 text-center">{qty}</span>
                          <button
                            onClick={() => setQty(item, qty + 1)}
                            aria-label={`Add one more ${item.name}`}
                            className="w-8 h-8 flex items-center justify-center text-primary"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="h-20" />

      {totalItems > 0 && (
        <div className="fixed left-0 right-0 bottom-0 sm:absolute px-4 pb-4 pt-3 safe-bottom bg-surface border-t border-border">
          <div className="max-w-sm mx-auto">
            <Button onClick={handlePlaceOrder}>
              <span className="flex items-center justify-center gap-2">
                <ShoppingBag size={15} />
                place order · ₹{totalPrice} ({totalItems} item{totalItems > 1 ? "s" : ""})
              </span>
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
