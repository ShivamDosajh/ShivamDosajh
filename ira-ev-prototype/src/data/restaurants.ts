import { routeChargers } from "./routeChargers";

export interface RestaurantStop {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceForTwo: number;
  /** The EV charger next to this restaurant — the reason it's a viable trip stop. */
  chargerId: string;
}

/** Restaurants along the corridor that happen to have EV charging nearby — the stop the
 * driver actually wants is the meal; the charger is what makes it a worthwhile trip stop. */
export const restaurants: RestaurantStop[] = [
  { id: "res-01", name: "Ghat Top Dhaba", cuisine: "North Indian · Punjabi", rating: 4.3, priceForTwo: 500, chargerId: "rc-01" },
  { id: "res-03", name: "Satara Deccan Cafe", cuisine: "Cafe · Continental", rating: 4.1, priceForTwo: 700, chargerId: "rc-03" },
  { id: "res-05", name: "Kolhapuri Tambda Rassa House", cuisine: "Maharashtrian", rating: 4.5, priceForTwo: 600, chargerId: "rc-05" },
  { id: "res-06", name: "Nipani Sugarcane Junction", cuisine: "South Indian · Juices", rating: 4.0, priceForTwo: 400, chargerId: "rc-06" },
  { id: "res-07", name: "Belagavi Kunda Sweets & Meals", cuisine: "Sweets · Thali", rating: 4.4, priceForTwo: 450, chargerId: "rc-07" },
  { id: "res-08", name: "Dharwad Peda House", cuisine: "Sweets · Snacks", rating: 4.2, priceForTwo: 300, chargerId: "rc-08" },
  { id: "res-10", name: "Davangere Benne Dosa Corner", cuisine: "South Indian", rating: 4.6, priceForTwo: 350, chargerId: "rc-10" },
  { id: "res-11", name: "Chitradurga Thali House", cuisine: "Thali · Multi-cuisine", rating: 4.0, priceForTwo: 500, chargerId: "rc-11" },
  { id: "res-12", name: "Sira Family Restaurant", cuisine: "Multi-cuisine", rating: 4.1, priceForTwo: 600, chargerId: "rc-12" },
  { id: "res-13", name: "Tumakuru Food Court", cuisine: "Food Court", rating: 3.9, priceForTwo: 350, chargerId: "rc-13" },
];

export function getRestaurantById(id: string): RestaurantStop | undefined {
  return restaurants.find((r) => r.id === id);
}

export function getChargerForRestaurant(restaurant: RestaurantStop) {
  return routeChargers.find((c) => c.id === restaurant.chargerId);
}
