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
          size={12}
          className={i <= Math.round(rating) ? "fill-warning text-warning" : "text-border"}
        />
      ))}
    </div>
  );
}

export function StationReviewsList({ reviews }: { reviews: StationReview[] }) {
  if (reviews.length === 0) {
    return <p className="text-[14px] text-secondaryText text-center py-8">no reviews yet</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {reviews.map((review) => (
        <div key={review.id} className="flex flex-col gap-2 rounded-card bg-surface border border-border p-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-semibold leading-4">{review.author}</p>
            <span className="text-[10px] font-light leading-4 text-metadataText shrink-0">
              {formatDaysAgo(review.daysAgo)}
            </span>
          </div>
          <StarRow rating={review.rating} />
          <p className="text-[12px] font-light leading-4 text-secondaryText">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
