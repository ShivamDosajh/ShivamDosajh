import { useState } from "react";
import { Star } from "lucide-react";

/** Shown once a charge finishes — the moment the driver's experience is freshest, so it's the
 * best point to ask for a rating instead of leaving the station's review list to go stale. */
export function ReviewNudgeCard({ stationName }: { stationName: string }) {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="w-full rounded-card bg-surfaceRaised border border-border px-4 py-3.5 text-center">
        <p className="text-[13px] text-primary font-medium">thanks for the feedback!</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-card bg-surfaceRaised border border-border px-4 py-3.5">
      <p className="text-[13px] font-medium text-center">how was charging at {stationName}?</p>
      <div className="flex items-center justify-center gap-2 mt-2.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            onClick={() => {
              setRating(i);
              setSubmitted(true);
            }}
            aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
            className="p-1"
          >
            <Star size={26} className={i <= rating ? "fill-warning text-warning" : "text-border"} />
          </button>
        ))}
      </div>
    </div>
  );
}
