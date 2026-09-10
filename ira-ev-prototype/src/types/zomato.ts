export interface MenuItem {
  id: string;
  name: string;
  price: number;
  veg: boolean;
  category: string;
}

export interface ZomatoRestaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  menu: MenuItem[];
}

export interface CartLine {
  item: MenuItem;
  qty: number;
}

export type ZomatoOrderStatus = "placed" | "preparing" | "on-the-way" | "delivered";

export interface ZomatoOrder {
  id: string;
  stationId: string;
  stationName: string;
  restaurant: ZomatoRestaurant;
  lines: CartLine[];
  totalPrice: number;
  placedAt: number;
  /** Minutes until the driver reaches the station — the order is timed to land at zero. */
  etaMinutesAtOrder: number;
  status: ZomatoOrderStatus;
}
