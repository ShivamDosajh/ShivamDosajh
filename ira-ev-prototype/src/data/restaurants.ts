import { routeChargers } from "./routeChargers";
import type { MenuItem, ZomatoRestaurant } from "../types/zomato";

export interface RestaurantStop {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceForTwo: number;
  /** The EV charger next to this restaurant — the reason it's a viable trip stop. */
  chargerId: string;
  menu: MenuItem[];
}

/** Restaurants along the corridor that happen to have EV charging nearby — the stop the
 * driver actually wants is the meal; the charger is what makes it a worthwhile trip stop. */
export const restaurants: RestaurantStop[] = [
  {
    id: "res-01",
    name: "Ghat Top Dhaba",
    cuisine: "North Indian · Punjabi",
    rating: 4.3,
    priceForTwo: 500,
    chargerId: "rc-01",
    menu: [
      { id: "res-01-m1", name: "Butter Paneer Masala", price: 260, veg: true, category: "mains" },
      { id: "res-01-m2", name: "Dal Makhani", price: 210, veg: true, category: "mains" },
      { id: "res-01-m3", name: "Tandoori Roti (2 pc)", price: 60, veg: true, category: "breads" },
      { id: "res-01-m4", name: "Masala Chai", price: 40, veg: true, category: "beverages" },
    ],
  },
  {
    id: "res-03",
    name: "Satara Deccan Cafe",
    cuisine: "Cafe · Continental",
    rating: 4.1,
    priceForTwo: 700,
    chargerId: "rc-03",
    menu: [
      { id: "res-03-m1", name: "Veg Club Sandwich", price: 180, veg: true, category: "mains" },
      { id: "res-03-m2", name: "Grilled Chicken Panini", price: 240, veg: false, category: "mains" },
      { id: "res-03-m3", name: "Cold Coffee", price: 130, veg: true, category: "beverages" },
      { id: "res-03-m4", name: "Chocolate Brownie", price: 150, veg: true, category: "desserts" },
    ],
  },
  {
    id: "res-05",
    name: "Kolhapuri Tambda Rassa House",
    cuisine: "Maharashtrian",
    rating: 4.5,
    priceForTwo: 600,
    chargerId: "rc-05",
    menu: [
      { id: "res-05-m1", name: "Tambda Rassa Thali", price: 320, veg: false, category: "mains" },
      { id: "res-05-m2", name: "Misal Pav", price: 140, veg: true, category: "mains" },
      { id: "res-05-m3", name: "Kolhapuri Sol Kadhi", price: 60, veg: true, category: "beverages" },
    ],
  },
  {
    id: "res-06",
    name: "Nipani Sugarcane Junction",
    cuisine: "South Indian · Juices",
    rating: 4.0,
    priceForTwo: 400,
    chargerId: "rc-06",
    menu: [
      { id: "res-06-m1", name: "Masala Dosa", price: 120, veg: true, category: "mains" },
      { id: "res-06-m2", name: "Idli Sambar (4 pc)", price: 90, veg: true, category: "mains" },
      { id: "res-06-m3", name: "Fresh Sugarcane Juice", price: 50, veg: true, category: "beverages" },
    ],
  },
  {
    id: "res-07",
    name: "Belagavi Kunda Sweets & Meals",
    cuisine: "Sweets · Thali",
    rating: 4.4,
    priceForTwo: 450,
    chargerId: "rc-07",
    menu: [
      { id: "res-07-m1", name: "Veg Thali", price: 220, veg: true, category: "mains" },
      { id: "res-07-m2", name: "Belgavi Kunda (250g)", price: 180, veg: true, category: "desserts" },
      { id: "res-07-m3", name: "Filter Coffee", price: 45, veg: true, category: "beverages" },
    ],
  },
  {
    id: "res-08",
    name: "Dharwad Peda House",
    cuisine: "Sweets · Snacks",
    rating: 4.2,
    priceForTwo: 300,
    chargerId: "rc-08",
    menu: [
      { id: "res-08-m1", name: "Dharwad Peda (250g)", price: 160, veg: true, category: "desserts" },
      { id: "res-08-m2", name: "Menasinkai Bajji", price: 90, veg: true, category: "mains" },
      { id: "res-08-m3", name: "Masala Chai", price: 40, veg: true, category: "beverages" },
    ],
  },
  {
    id: "res-10",
    name: "Davangere Benne Dosa Corner",
    cuisine: "South Indian",
    rating: 4.6,
    priceForTwo: 350,
    chargerId: "rc-10",
    menu: [
      { id: "res-10-m1", name: "Benne (Butter) Dosa", price: 130, veg: true, category: "mains" },
      { id: "res-10-m2", name: "Rava Idli (4 pc)", price: 100, veg: true, category: "mains" },
      { id: "res-10-m3", name: "Filter Coffee", price: 45, veg: true, category: "beverages" },
    ],
  },
  {
    id: "res-11",
    name: "Chitradurga Thali House",
    cuisine: "Thali · Multi-cuisine",
    rating: 4.0,
    priceForTwo: 500,
    chargerId: "rc-11",
    menu: [
      { id: "res-11-m1", name: "Veg Thali", price: 220, veg: true, category: "mains" },
      { id: "res-11-m2", name: "Chicken Chettinad", price: 290, veg: false, category: "mains" },
      { id: "res-11-m3", name: "Gulab Jamun (2 pc)", price: 70, veg: true, category: "desserts" },
    ],
  },
  {
    id: "res-12",
    name: "Sira Family Restaurant",
    cuisine: "Multi-cuisine",
    rating: 4.1,
    priceForTwo: 600,
    chargerId: "rc-12",
    menu: [
      { id: "res-12-m1", name: "Mutton Biryani", price: 340, veg: false, category: "mains" },
      { id: "res-12-m2", name: "Paneer Roll", price: 140, veg: true, category: "mains" },
      { id: "res-12-m3", name: "Cold Coffee", price: 130, veg: true, category: "beverages" },
    ],
  },
  {
    id: "res-13",
    name: "Tumakuru Food Court",
    cuisine: "Food Court",
    rating: 3.9,
    priceForTwo: 350,
    chargerId: "rc-13",
    menu: [
      { id: "res-13-m1", name: "Veg Fried Rice", price: 150, veg: true, category: "mains" },
      { id: "res-13-m2", name: "Chicken 65", price: 220, veg: false, category: "mains" },
      { id: "res-13-m3", name: "Masala Chai", price: 40, veg: true, category: "beverages" },
    ],
  },
];

export function getRestaurantById(id: string): RestaurantStop | undefined {
  return restaurants.find((r) => r.id === id);
}

export function getRestaurantByChargerId(chargerId: string): RestaurantStop | undefined {
  return restaurants.find((r) => r.chargerId === chargerId);
}

export function getChargerForRestaurant(restaurant: RestaurantStop) {
  return routeChargers.find((c) => c.id === restaurant.chargerId);
}

/** Adapts a route-planner restaurant into the shape the Zomato ordering feature expects. */
export function toZomatoRestaurant(r: RestaurantStop): ZomatoRestaurant {
  return { id: r.id, name: r.name, cuisine: r.cuisine, rating: r.rating, menu: r.menu };
}
