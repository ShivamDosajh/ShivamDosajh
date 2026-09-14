import { Zap } from "lucide-react";

interface ChargingProgressRingProps {
  percent: number;
  size?: number;
  complete: boolean;
}

export function ChargingProgressRing({ percent, size = 176, complete }: ChargingProgressRingProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {!complete && (
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse pointer-events-none" />
      )}
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="text-surfaceRaised"
          stroke="currentColor"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={complete ? "text-success" : "text-primary"}
          stroke="currentColor"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s linear, color 0.3s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        {!complete && <Zap size={16} className="text-primary mb-0.5" />}
        <span className="text-[30px] font-bold leading-none tabular-nums">{Math.round(clamped)}%</span>
        <span className="text-[11px] text-secondaryText">{complete ? "charge complete" : "charging"}</span>
      </div>
    </div>
  );
}
