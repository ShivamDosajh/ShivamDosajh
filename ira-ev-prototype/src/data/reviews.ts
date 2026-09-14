import { hashString } from "../utils/hash";

export interface StationReview {
  id: string;
  author: string;
  rating: number;
  daysAgo: number;
  comment: string;
}

const REVIEW_POOL: { author: string; comment: string }[] = [
  { author: "Rohan K.", comment: "Fast and reliable, no queue at this hour." },
  { author: "Priya S.", comment: "Charger worked great, payment via the app was instant." },
  { author: "Amit V.", comment: "Good location, clean bay, would come again." },
  { author: "Sneha M.", comment: "One gun was down but staff redirected me quickly." },
  { author: "Karthik R.", comment: "Charging speed matched what the app promised." },
  { author: "Divya N.", comment: "Slightly hard to find but worth it — great rates." },
  { author: "Farhan A.", comment: "Plugged in and paid without leaving my car. Smooth." },
  { author: "Meera J.", comment: "Busy in the evenings, go early if you can." },
];

/** Deterministic mock reviews for a station — same station always returns the same set, so
 * they don't shuffle on every render. Stations without a rating yet show none. */
export function getReviewsForStation(stationId: string, rating: number | null): StationReview[] {
  if (rating === null) return [];
  const seed = hashString(stationId);
  const count = 2 + (seed % 3);
  const reviews: StationReview[] = [];
  for (let i = 0; i < count; i++) {
    const pick = REVIEW_POOL[(seed + i * 7) % REVIEW_POOL.length];
    const jitter = ((seed + i * 13) % 9) / 10 - 0.4;
    const reviewRating = Math.max(1, Math.min(5, Math.round((rating + jitter) * 2) / 2));
    reviews.push({
      id: `${stationId}-review-${i}`,
      author: pick.author,
      rating: reviewRating,
      daysAgo: 1 + ((seed + i * 5) % 30),
      comment: pick.comment,
    });
  }
  return reviews;
}
