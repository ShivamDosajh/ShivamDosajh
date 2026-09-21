import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";

/** Shown once a charge finishes — the moment the driver's experience is freshest, so it's the
 * best point to ask for a rating instead of leaving the station's review list to go stale.
 * Picking a star doesn't submit immediately: it reveals an optional comment field and a
 * "done" button, so the driver can add a note before the rating actually posts. */
export function ReviewNudgeCard({ stationName }: { stationName: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="w-full rounded-card bg-surfaceRaised border border-border px-4 py-5 flex flex-col items-center gap-2 text-center">
        <CheckCircle2 size={28} className="text-success" />
        <p className="text-[14px] text-text font-medium">thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-card bg-surfaceRaised border border-border px-4 py-3.5">
      <p className="text-[14px] font-medium text-center">how was charging at {stationName}?</p>
      <div className="flex items-center justify-center gap-2 mt-2.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            onClick={() => setRating(i)}
            aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
            className="p-1"
          >
            <Star size={26} className={i <= rating ? "fill-warning text-warning" : "text-border"} />
          </button>
        ))}
      </div>

      {rating > 0 && (
        <div className="mt-3 animate-fade-in">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="tell us more about your experience (optional)"
            rows={2}
            className="w-full rounded-button bg-surface border border-border px-3 py-2.5 text-[14px] text-text placeholder:text-secondaryText outline-none resize-none"
          />
          <button
            onClick={() => setSubmitted(true)}
            className="w-full h-10 rounded-button bg-primary text-textOnAction text-[14px] font-semibold mt-2.5"
          >
            submit
          </button>
        </div>
      )}
    </div>
  );
}
