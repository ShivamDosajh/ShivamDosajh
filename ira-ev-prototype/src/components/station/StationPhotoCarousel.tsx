import { Zap, Car, MapPinned, Building2 } from "lucide-react";
import { hashString } from "../../utils/hash";

const SLIDES: { label: string; icon: typeof Zap }[] = [
  { label: "charging bay", icon: Zap },
  { label: "connector close-up", icon: Building2 },
  { label: "parking area", icon: Car },
  { label: "entrance", icon: MapPinned },
];

const GRADIENTS = [
  "from-primary/35 via-primaryDark/25 to-surface",
  "from-emerald-500/30 via-teal-700/25 to-surface",
  "from-cyan-500/25 via-primaryDark/20 to-surface",
  "from-primary/25 via-emerald-700/20 to-surface",
];

/** No real station photography exists in this mock dataset — these are stand-in gradient
 * panels (not photos) so the layout, scroll behaviour, and placement can be reviewed now;
 * swapping in real photos later is a drop-in change to this one component. */
export function StationPhotoCarousel({ stationId }: { stationId: string }) {
  const seed = hashString(stationId);

  return (
    <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 snap-x snap-mandatory">
      {SLIDES.map((slide, i) => {
        const Icon = slide.icon;
        const gradient = GRADIENTS[(seed + i) % GRADIENTS.length];
        return (
          <div
            key={slide.label}
            className={`relative shrink-0 w-[140px] h-[88px] rounded-card overflow-hidden snap-start bg-gradient-to-br ${gradient} border border-border`}
          >
            <div className="absolute inset-0 flex items-center justify-center text-white/70">
              <Icon size={24} />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1">
              <p className="text-[11px] text-white capitalize truncate">{slide.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
