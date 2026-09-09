export function MockMapBackground() {
  return (
    <svg
      viewBox="0 0 400 800"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="400" height="800" fill="#dff0e4" />
      <path d="M0,120 Q120,180 90,320 Q60,460 140,560 Q200,640 160,800" fill="none" stroke="#bcdfc9" strokeWidth="70" opacity="0.7" />
      <path d="M400,60 Q300,140 340,260 Q380,380 300,480" fill="none" stroke="#bcdfc9" strokeWidth="60" opacity="0.6" />
      <path d="M0,540 Q140,520 220,600 Q300,680 400,660" fill="none" stroke="#a9c9e8" strokeWidth="10" opacity="0.8" />
      <path d="M340,0 Q320,120 360,220 Q400,300 380,400" fill="none" stroke="#a9c9e8" strokeWidth="8" opacity="0.7" />
      <path d="M0,300 L400,420" stroke="#c9c9cf" strokeWidth="26" strokeLinecap="round" />
      <path d="M0,300 L400,420" stroke="#b7b7bf" strokeWidth="20" strokeLinecap="round" />
      <path d="M60,0 L200,800" stroke="#c9c9cf" strokeWidth="18" strokeLinecap="round" />
      <path d="M180,0 L340,800" stroke="#d6d6dc" strokeWidth="10" />
      <path d="M0,560 L400,520" stroke="#d6d6dc" strokeWidth="10" />
      <path d="M0,680 L400,760" stroke="#d6d6dc" strokeWidth="8" />
      <g opacity="0.9">
        <circle cx="90" cy="240" r="3" fill="#a3b5a8" />
        <circle cx="130" cy="260" r="3" fill="#a3b5a8" />
        <circle cx="70" cy="290" r="3" fill="#a3b5a8" />
        <circle cx="310" cy="140" r="3" fill="#a3b5a8" />
        <circle cx="260" cy="600" r="3" fill="#a3b5a8" />
        <circle cx="120" cy="620" r="3" fill="#a3b5a8" />
      </g>
    </svg>
  );
}
