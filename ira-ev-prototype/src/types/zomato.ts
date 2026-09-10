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
  /** How arrival was described to the user at order time — "~5 min" for a nearby station, an ETA clock time ("12:31") for a stop on a planned trip. */
  arrivalLabel: string;
  status: ZomatoOrderStatus;
}
