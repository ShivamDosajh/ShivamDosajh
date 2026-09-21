import { Star } from "lucide-react";

interface RatingProps {
  value: number | null;
}

/** Compact horizontal rating — 24px icon, 4px gap, Inter Regular 14/24. */
export function Rating({ value }: RatingProps) {
  if (value === null) {
    return <span className="text-[14px] leading-6 text-secondaryText">--</span>;
  }
  return (
    <span className="flex items-center gap-1 text-[14px] leading-6 text-text">
      <Star size={24} className="fill-warning text-warning" />
      {value.toFixed(1)}
    </span>
  );
}
