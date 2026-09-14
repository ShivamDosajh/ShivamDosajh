import { Lightbulb, Sparkles, Tag, Bell, Leaf, ShieldCheck, type LucideIcon } from "lucide-react";

export type ChargingBannerKind = "tip" | "feature" | "offer" | "nudge";

export interface ChargingBanner {
  id: string;
  kind: ChargingBannerKind;
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

export const chargingBanners: ChargingBanner[] = [
  {
    id: "tip-precool",
    kind: "tip",
    icon: Lightbulb,
    title: "Pre-cool your cabin",
    subtitle: "Running AC while still plugged in saves range once you unplug.",
  },
  {
    id: "offer-next-session",
    kind: "offer",
    icon: Tag,
    title: "20% off your next session",
    subtitle: "Use code CHARGE20 on any Tata Power station this week.",
  },
  {
    id: "feature-zomato",
    kind: "feature",
    icon: Sparkles,
    title: "Hungry? Order while you wait",
    subtitle: "Get food delivered to your bay — ready right as you finish.",
  },
  {
    id: "tip-battery-health",
    kind: "tip",
    icon: ShieldCheck,
    title: "Charging to 80% is healthier",
    subtitle: "For daily driving, stopping around 80% extends battery life.",
  },
  {
    id: "nudge-route-planner",
    kind: "nudge",
    icon: Bell,
    title: "Planning a long trip?",
    subtitle: "Try the Routes tab — it plans your charging stops for you.",
  },
  {
    id: "tip-eco-impact",
    kind: "tip",
    icon: Leaf,
    title: "You've saved 1.2t of CO₂",
    subtitle: "Based on your charging history this year. Keep it up!",
  },
];
