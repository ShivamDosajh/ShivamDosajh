import { useEffect, useState } from "react";
import { chargingBanners, type ChargingBannerKind } from "../../data/chargingBanners";

const KIND_STYLES: Record<ChargingBannerKind, { bg: string; border: string; iconBg: string; iconText: string }> = {
  tip: { bg: "bg-surfaceRaised", border: "border-border", iconBg: "bg-primary/15", iconText: "text-primary" },
  feature: { bg: "bg-primary/10", border: "border-primary/30", iconBg: "bg-primary/20", iconText: "text-primary" },
  offer: { bg: "bg-warning/10", border: "border-warning/30", iconBg: "bg-warning/20", iconText: "text-warning" },
  nudge: { bg: "bg-surfaceRaised", border: "border-border", iconBg: "bg-primary/15", iconText: "text-primary" },
};

const ROTATE_MS = 4500;

/** Auto-rotating carousel of tips, feature nudges, and offers shown while a charge is in
 * progress — every banner swaps every ~4.5s with a small fade/slide-in, and dots let the
 * viewer jump to one directly. */
export function PromoBannerCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % chargingBanners.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const banner = chargingBanners[index];
  const Icon = banner.icon;
  const style = KIND_STYLES[banner.kind];

  return (
    <div className="w-full">
      <div
        key={banner.id}
        className={`animate-banner-in flex items-center gap-3 rounded-card border px-3.5 py-3 ${style.bg} ${style.border}`}
      >
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconText}`}>
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-text font-medium truncate">{banner.title}</p>
          <p className="text-[11px] text-secondaryText mt-0.5 leading-snug">{banner.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-2.5">
        {chargingBanners.map((b, i) => (
          <button
            key={b.id}
            onClick={() => setIndex(i)}
            aria-label={`Show tip ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-primary" : "w-1.5 bg-border"}`}
          />
        ))}
      </div>
    </div>
  );
}
