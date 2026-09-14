import { Star } from "lucide-react";
import type { StationReview } from "../../data/reviews";

function formatDaysAgo(days: number): string {
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return `${Math.round(days / 30)} mo ago`;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={11}
          className={i <= Math.round(rating) ? "fill-warning text-warning" : "text-border"}
        />
      ))}
    </div>
  );
}

export function StationReviewsList({ reviews }: { reviews: StationReview[] }) {
  if (reviews.length === 0) {
    return <p className="text-[13px] text-secondaryText text-center py-8">no reviews yet</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-card bg-surfaceRaised border border-border px-3.5 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-medium">{review.author}</p>
            <span className="text-[11px] text-secondaryText shrink-0">{formatDaysAgo(review.daysAgo)}</span>
          </div>
          <div className="mt-1">
            <StarRow rating={review.rating} />
          </div>
          <p className="text-[12px] text-secondaryText mt-1.5 leading-relaxed">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
