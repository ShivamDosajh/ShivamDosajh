import type { ReactElement } from "react";

const LAND = "#f4f1ec";
const WATER = "#aad3e8";
const PARK = "#c9e4bf";
const PARK_LINE = "#b3d4a6";
const HIGHWAY = "#f6b84f";
const HIGHWAY_LINE = "#e0993a";
const ARTERIAL = "#ffffff";
const ARTERIAL_LINE = "#d8d5cc";
const LOCAL_STREET = "#ffffff";
const LOCAL_STREET_LINE = "#e4e1d8";
const BUILDING = "#e3ded2";

interface UrbanBlock {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A small grid of local streets + building parcels standing in for a city block — repeated
 * a few times at different positions/scales to read as "urban area" without hand-authoring
 * every rect. */
function UrbanGrid({ x, y, cols, rows, cell, seed }: { x: number; y: number; cols: number; rows: number; cell: number; seed: number }) {
  const lines: ReactElement[] = [];
  const blocks: UrbanBlock[] = [];
  const width = cols * cell;
  const height = rows * cell;

  for (let i = 0; i <= cols; i++) {
    lines.push(
      <line key={`v${i}`} x1={x + i * cell} y1={y} x2={x + i * cell} y2={y + height} stroke={LOCAL_STREET_LINE} strokeWidth={3} />
    );
  }
  for (let j = 0; j <= rows; j++) {
    lines.push(
      <line key={`h${j}`} x1={x} y1={y + j * cell} x2={x + width} y2={y + j * cell} stroke={LOCAL_STREET_LINE} strokeWidth={3} />
    );
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // Deterministic pseudo-random fill so parcels vary in size/occupancy without a random seed.
      const n = (seed + i * 7 + j * 13) % 10;
      if (n < 3) continue; // leave some parcels empty (a plaza / gap)
      const pad = 2.5 + (n % 3);
      blocks.push({
        x: x + i * cell + pad,
        y: y + j * cell + pad,
        w: cell - pad * 2,
        h: cell - pad * 2,
      });
    }
  }

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={LOCAL_STREET} opacity={0.35} />
      {lines}
      {blocks.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={1.5} fill={BUILDING} />
      ))}
    </g>
  );
}

export function MockMapBackground() {
  return (
    <svg viewBox="0 0 400 800" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="800" fill={LAND} />

      {/* Parks */}
      <path
        d="M20,150 Q80,110 150,140 Q200,165 170,230 Q130,280 60,260 Q0,240 20,150 Z"
        fill={PARK}
        stroke={PARK_LINE}
        strokeWidth="2"
      />
      <path
        d="M250,520 Q320,490 370,540 Q400,590 350,630 Q290,660 250,610 Q220,565 250,520 Z"
        fill={PARK}
        stroke={PARK_LINE}
        strokeWidth="2"
      />
      <path d="M60,650 Q110,635 140,670 Q150,700 110,715 Q70,720 55,690 Q45,665 60,650 Z" fill={PARK} stroke={PARK_LINE} strokeWidth="2" />

      {/* Water body — a river cutting through the lower-left */}
      <path
        d="M-10,470 Q100,440 140,500 Q180,560 130,620 Q90,670 130,730 Q160,770 130,810 L-10,810 Z"
        fill={WATER}
      />
      <path d="M-10,470 Q100,440 140,500 Q180,560 130,620 Q90,670 130,730 Q160,770 130,810" fill="none" stroke="#8fc2dd" strokeWidth="1.5" opacity="0.6" />

      {/* Arterial roads */}
      <path d="M0,300 L400,420" stroke={ARTERIAL_LINE} strokeWidth="9" strokeLinecap="round" />
      <path d="M0,300 L400,420" stroke={ARTERIAL} strokeWidth="6" strokeLinecap="round" />
      <path d="M180,0 L340,800" stroke={ARTERIAL_LINE} strokeWidth="7" />
      <path d="M180,0 L340,800" stroke={ARTERIAL} strokeWidth="4.5" />
      <path d="M0,560 L400,520" stroke={ARTERIAL_LINE} strokeWidth="6" />
      <path d="M0,560 L400,520" stroke={ARTERIAL} strokeWidth="4" />

      {/* Local streets grid (freestanding, outside the urban blocks) */}
      <g opacity="0.8">
        <line x1="0" y1="90" x2="400" y2="80" stroke={LOCAL_STREET_LINE} strokeWidth="2.5" />
        <line x1="0" y1="200" x2="400" y2="195" stroke={LOCAL_STREET_LINE} strokeWidth="2.5" />
        <line x1="0" y1="700" x2="400" y2="710" stroke={LOCAL_STREET_LINE} strokeWidth="2.5" />
        <line x1="60" y1="0" x2="40" y2="800" stroke={LOCAL_STREET_LINE} strokeWidth="2.5" />
        <line x1="370" y1="0" x2="390" y2="800" stroke={LOCAL_STREET_LINE} strokeWidth="2.5" />
      </g>

      {/* Highway — the main corridor, thick with a dashed centerline like a national highway */}
      <path d="M60,0 L200,800" stroke={HIGHWAY_LINE} strokeWidth="18" strokeLinecap="round" />
      <path d="M60,0 L200,800" stroke={HIGHWAY} strokeWidth="14" strokeLinecap="round" />
      <path d="M60,0 L200,800" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="10 10" opacity="0.85" />

      {/* Urban blocks — small city-grid patches so the map doesn't read as empty countryside */}
      <UrbanGrid x={210} y={40} cols={4} rows={5} cell={22} seed={3} />
      <UrbanGrid x={30} y={340} cols={3} rows={4} cell={20} seed={7} />
      <UrbanGrid x={260} y={330} cols={3} rows={3} cell={18} seed={1} />
      <UrbanGrid x={150} y={600} cols={4} rows={3} cell={19} seed={5} />

      {/* Scattered trees / greenery dots outside the parks */}
      <g opacity="0.9" fill="#9db98f">
        <circle cx="90" cy="240" r="2.6" />
        <circle cx="130" cy="260" r="2.6" />
        <circle cx="310" cy="140" r="2.6" />
        <circle cx="20" cy="480" r="2.6" />
        <circle cx="350" cy="480" r="2.6" />
        <circle cx="120" cy="770" r="2.6" />
      </g>
    </svg>
  );
}
