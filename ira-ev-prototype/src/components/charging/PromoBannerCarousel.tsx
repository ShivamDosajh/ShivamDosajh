import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { chargingBanners, type ChargingBannerKind } from "../../data/chargingBanners";

const KIND_STYLES: Record<ChargingBannerKind, { bg: string; border: string; iconBg: string; iconText: string }> = {
  tip: { bg: "bg-surfaceRaised", border: "border-border", iconBg: "bg-primary/15", iconText: "text-primary" },
  feature: { bg: "bg-primary/10", border: "border-primary/30", iconBg: "bg-primary/20", iconText: "text-primary" },
  offer: { bg: "bg-warning/10", border: "border-warning/30", iconBg: "bg-warning/20", iconText: "text-warning" },
  nudge: { bg: "bg-surfaceRaised", border: "border-border", iconBg: "bg-primary/15", iconText: "text-primary" },
};

const ROTATE_MS = 4500;
const SWIPE_THRESHOLD_PX = 40;

/** Auto-rotating carousel of tips, feature nudges, and offers shown while a charge is in
 * progress — every banner swaps every ~4.5s with a small fade/slide-in. The viewer can also
 * move between tips manually: swipe left/right, tap the edge arrows, or jump straight to one
 * via the dots — any manual move just re-bases the auto-rotate timer instead of fighting it. */
export function PromoBannerCarousel() {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goTo = (next: number) => {
    setIndex(((next % chargingBanners.length) + chargingBanners.length) % chargingBanners.length);
  };
  const goPrev = () => goTo(index - 1);
  const goNext = () => goTo(index + 1);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % chargingBanners.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [index]);

  const banner = chargingBanners[index];
  const Icon = banner.icon;
  const style = KIND_STYLES[banner.kind];

  return (
    <div className="w-full">
      <div
        className="relative"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (dx > SWIPE_THRESHOLD_PX) goPrev();
          else if (dx < -SWIPE_THRESHOLD_PX) goNext();
        }}
      >
        <div
          key={banner.id}
          className={`animate-banner-in flex items-center gap-3 rounded-card border px-3.5 py-3 ${style.bg} ${style.border}`}
        >
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconText}`}>
            <Icon size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] text-text font-medium truncate">{banner.title}</p>
            <p className="text-[12px] text-secondaryText mt-0.5 leading-snug">{banner.subtitle}</p>
          </div>
        </div>

        <button
          onClick={goPrev}
          aria-label="Previous tip"
          className="absolute left-0.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-surface flex items-center justify-center text-white"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          onClick={goNext}
          aria-label="Next tip"
          className="absolute right-0.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-surface flex items-center justify-center text-white"
        >
          <ChevronRight size={15} />
        </button>
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-2.5">
        {chargingBanners.map((b, i) => (
          <button
            key={b.id}
            onClick={() => goTo(i)}
            aria-label={`Show tip ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-primary" : "w-1.5 bg-border"}`}
          />
        ))}
      </div>
    </div>
  );
}
