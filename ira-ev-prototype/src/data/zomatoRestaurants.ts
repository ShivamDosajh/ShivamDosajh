import type { ZomatoRestaurant } from "../types/zomato";

const zomatoRestaurants: ZomatoRestaurant[] = [
  {
    id: "zr-01",
    name: "Highway Bites Dhaba",
    cuisine: "North Indian · Punjabi",
    rating: 4.2,
    menu: [
      { id: "m-01", name: "Butter Paneer Masala", price: 260, veg: true, category: "mains" },
      { id: "m-02", name: "Dal Makhani", price: 210, veg: true, category: "mains" },
      { id: "m-03", name: "Chicken Tikka Masala", price: 320, veg: false, category: "mains" },
      { id: "m-04", name: "Tandoori Roti (2 pc)", price: 60, veg: true, category: "breads" },
      { id: "m-05", name: "Masala Chai", price: 40, veg: true, category: "beverages" },
    ],
  },
  {
    id: "zr-02",
    name: "South Junction Express",
    cuisine: "South Indian",
    rating: 4.5,
    menu: [
      { id: "m-06", name: "Masala Dosa", price: 120, veg: true, category: "mains" },
      { id: "m-07", name: "Idli Sambar (4 pc)", price: 90, veg: true, category: "mains" },
      { id: "m-08", name: "Chicken Chettinad", price: 290, veg: false, category: "mains" },
      { id: "m-09", name: "Filter Coffee", price: 45, veg: true, category: "beverages" },
    ],
  },
  {
    id: "zr-03",
    name: "Cafe Deccan",
    cuisine: "Cafe · Continental",
    rating: 4.0,
    menu: [
      { id: "m-10", name: "Veg Club Sandwich", price: 180, veg: true, category: "mains" },
      { id: "m-11", name: "Grilled Chicken Panini", price: 240, veg: false, category: "mains" },
      { id: "m-12", name: "Cold Coffee", price: 130, veg: true, category: "beverages" },
      { id: "m-13", name: "Chocolate Brownie", price: 150, veg: true, category: "desserts" },
    ],
  },
  {
    id: "zr-04",
    name: "Spice Route Family Restaurant",
    cuisine: "Multi-cuisine",
    rating: 4.1,
    menu: [
      { id: "m-14", name: "Veg Thali", price: 220, veg: true, category: "mains" },
      { id: "m-15", name: "Mutton Biryani", price: 340, veg: false, category: "mains" },
      { id: "m-16", name: "Paneer Roll", price: 140, veg: true, category: "mains" },
      { id: "m-17", name: "Gulab Jamun (2 pc)", price: 70, veg: true, category: "desserts" },
    ],
  },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministically picks the "nearby" Zomato-partner restaurant for a given charging station. */
export function getZomatoRestaurantForStation(stationId: string): ZomatoRestaurant {
  const idx = hashString(stationId) % zomatoRestaurants.length;
  return zomatoRestaurants[idx];
}
