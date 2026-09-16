import type { ReactElement } from "react";
import { hashString } from "../../utils/hash";

const CAR_COLORS = ["#c94b4b", "#3a6ea5", "#e8e8e8", "#2f2f35", "#4a7a4a"];
const SKY_VARIANTS: [string, string][] = [
  ["#bcd9ec", "#e7ecdf"],
  ["#f3c9a0", "#dfe3ea"],
];

function CarShape({ x, y, scale = 1, color }: { x: number; y: number; scale?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="18" cy="21" rx="20" ry="3" fill="#000" opacity="0.18" />
      <rect x="1" y="8" width="34" height="12" rx="3" fill={color} />
      <path d="M6,8 L11,1 H25 L30,8 Z" fill={color} />
      <path d="M12,7 L14.5,2.2 H22 L24.5,7 Z" fill="#cfe9f5" opacity="0.85" />
      <circle cx="9" cy="20" r="3.6" fill="#1a1a1a" />
      <circle cx="9" cy="20" r="1.3" fill="#666" />
      <circle cx="27" cy="20" r="3.6" fill="#1a1a1a" />
      <circle cx="27" cy="20" r="1.3" fill="#666" />
      <rect x="1" y="8" width="34" height="12" rx="3" fill="none" stroke="#000" strokeOpacity="0.15" />
    </g>
  );
}

/** A DC fast-charging pillar — body, screen, connector holster, and a status LED. */
function ChargingBaySlide({ seed }: { seed: number }) {
  const [skyTop, skyBottom] = SKY_VARIANTS[seed % SKY_VARIANTS.length];
  const carColor = CAR_COLORS[(seed + 1) % CAR_COLORS.length];
  const ledOn = seed % 5 !== 0;
  return (
    <svg viewBox="0 0 140 88" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id={`sky-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
        <linearGradient id={`pillar-${seed}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f2f2f2" />
          <stop offset="1" stopColor="#c7c9cc" />
        </linearGradient>
      </defs>
      <rect width="140" height="50" fill={`url(#sky-${seed})`} />
      <rect y="48" width="140" height="40" fill="#3a3d42" />
      <rect y="48" width="140" height="3" fill="#54585e" />
      {[10, 32, 54, 76, 98, 120].map((lx) => (
        <rect key={lx} x={lx} y="60" width="9" height="24" fill="#565a60" opacity="0.55" transform={`skewX(-18)`} />
      ))}
      <CarShape x={16} y={44} scale={1.05} color={carColor} />
      <path d="M60,55 Q78,50 96,58" stroke="#1c1c1c" strokeWidth="2" fill="none" strokeLinecap="round" />
      <g transform="translate(96,24)">
        <rect width="20" height="48" rx="4" fill={`url(#pillar-${seed})`} stroke="#9a9ea3" />
        <rect x="3" y="6" width="14" height="16" rx="1.5" fill="#123" />
        <rect x="4.5" y="7.5" width="11" height="7" fill="#0fbfa8" opacity="0.85" />
        <circle cx="10" cy="28" r="3.2" fill="#1b1b1b" />
        <circle cx={ledOn ? 15.5 : 15.5} cy="34" r="1.4" fill={ledOn ? "#3ddc72" : "#7a2020"} />
      </g>
    </svg>
  );
}

/** A close-up of a CCS2 connector with a soft bokeh background, as if hand-held mid-plug. */
function ConnectorCloseupSlide({ seed }: { seed: number }) {
  const bokeh = Array.from({ length: 6 }, (_, i) => {
    const bx = 10 + ((seed + i * 37) % 120);
    const by = 8 + ((seed + i * 53) % 70);
    const r = 4 + ((seed + i * 19) % 10);
    return { bx, by, r };
  });
  return (
    <svg viewBox="0 0 140 88" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id={`conn-bg-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1c2a2c" />
          <stop offset="1" stopColor="#0e1416" />
        </linearGradient>
      </defs>
      <rect width="140" height="88" fill={`url(#conn-bg-${seed})`} />
      {bokeh.map((b, i) => (
        <circle key={i} cx={b.bx} cy={b.by} r={b.r} fill="#0fbfa8" opacity="0.12" />
      ))}
      <g transform="translate(30,14) rotate(-8)">
        <rect x="0" y="10" width="34" height="46" rx="10" fill="#20242a" stroke="#3a3f47" strokeWidth="1.5" />
        <rect x="6" y="0" width="22" height="16" rx="4" fill="#2b3038" stroke="#3a3f47" />
        <circle cx="10" cy="26" r="6" fill="#0c0d0f" stroke="#4a5058" strokeWidth="1" />
        <circle cx="24" cy="26" r="6" fill="#0c0d0f" stroke="#4a5058" strokeWidth="1" />
        <circle cx="10" cy="26" r="2.4" fill="#555c66" />
        <circle cx="24" cy="26" r="2.4" fill="#555c66" />
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i / 4) * Math.PI + Math.PI;
          const cx = 17 + Math.cos(angle) * 10;
          const cy = 42 + Math.sin(angle) * 6;
          return <circle key={i} cx={cx} cy={cy} r="1.6" fill="#454b53" />;
        })}
        <rect x="-3" y="52" width="40" height="10" rx="5" fill="#14171b" />
      </g>
      <path d="M18,70 Q10,50 22,20" stroke="#14171b" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M18,70 Q10,50 22,20" stroke="#2b3038" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/** A painted parking bay with a couple of cars at rest, seen from a slight elevated angle. */
function ParkingAreaSlide({ seed }: { seed: number }) {
  const [skyTop, skyBottom] = SKY_VARIANTS[(seed + 1) % SKY_VARIANTS.length];
  const carA = CAR_COLORS[seed % CAR_COLORS.length];
  const carB = CAR_COLORS[(seed + 2) % CAR_COLORS.length];
  return (
    <svg viewBox="0 0 140 88" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id={`pk-sky-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
      </defs>
      <rect width="140" height="26" fill={`url(#pk-sky-${seed})`} />
      <rect y="24" width="140" height="64" fill="#44484d" />
      <rect y="24" width="140" height="3" fill="#5b6066" />
      {[-10, 24, 58, 92, 126].map((lx) => (
        <path key={lx} d={`M${lx},88 L${lx + 14},30 L${lx + 18},30 L${lx + 6},88 Z`} fill="#dfe1e4" opacity="0.5" />
      ))}
      <circle cx="112" cy="18" r="16" fill={seed % 2 === 0 ? "#fff6d8" : "#e8eef2"} opacity="0.7" />
      <CarShape x={22} y={46} scale={0.9} color={carA} />
      <CarShape x={78} y={40} scale={0.78} color={carB} />
    </svg>
  );
}

/** A charging-station entrance: canopy, glass frontage, and a branded signage panel. */
function EntranceSlide({ seed }: { seed: number }) {
  const [skyTop, skyBottom] = SKY_VARIANTS[seed % SKY_VARIANTS.length];
  return (
    <svg viewBox="0 0 140 88" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id={`ent-sky-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
        <linearGradient id={`glass-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8fb9d6" />
          <stop offset="1" stopColor="#3f5f77" />
        </linearGradient>
      </defs>
      <rect width="140" height="88" fill={`url(#ent-sky-${seed})`} />
      <rect y="60" width="140" height="28" fill="#787c81" />
      <rect x="10" y="20" width="120" height="42" fill="#e7e5df" />
      <rect x="10" y="20" width="120" height="42" fill={`url(#glass-${seed})`} opacity="0.35" />
      {[26, 50, 74, 98, 122].map((lx) => (
        <rect key={lx} x={lx} y="20" width="2" height="42" fill="#ffffff" opacity="0.4" />
      ))}
      <rect x="10" y="10" width="120" height="12" fill="#2f333a" />
      <rect x="10" y="10" width="120" height="12" fill="none" stroke="#1c1e22" />
      <g transform="translate(52,42)">
        <rect width="36" height="20" fill="#0fbfa8" rx="1.5" />
        <path d="M18,4 L13,12 H17 L14,18 L23,9 H18 Z" fill="#0b2320" />
      </g>
      <rect x="55" y="62" width="30" height="26" fill="#26292e" />
      <rect x="18" y="62" width="14" height="4" fill="#c9cdd2" opacity="0.6" />
      <rect x="108" y="62" width="14" height="4" fill="#c9cdd2" opacity="0.6" />
    </svg>
  );
}

const SLIDES: { label: string; Slide: (props: { seed: number }) => ReactElement }[] = [
  { label: "charging bay", Slide: ChargingBaySlide },
  { label: "connector close-up", Slide: ConnectorCloseupSlide },
  { label: "parking area", Slide: ParkingAreaSlide },
  { label: "entrance", Slide: EntranceSlide },
];

/** Stylized (but layered, shaded, seed-varied) illustrations standing in for real station
 * photography, which doesn't exist for this mock dataset — closer to a photo than a flat
 * gradient-plus-icon tile, while staying a drop-in swap for real photos later. */
export function StationPhotoCarousel({ stationId }: { stationId: string }) {
  const seed = hashString(stationId);

  return (
    <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 snap-x snap-mandatory">
      {SLIDES.map(({ label, Slide }, i) => (
        <div
          key={label}
          className="relative shrink-0 w-[140px] h-[88px] rounded-card overflow-hidden snap-start border border-border"
        >
          <Slide seed={seed + i * 7} />
          <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1">
            <p className="text-[11px] text-white capitalize truncate">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
