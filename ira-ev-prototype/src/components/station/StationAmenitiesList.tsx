import type { StationAmenity } from "../../data/amenities";

function formatDistance(m: number): string {
  return `${Math.round(m / 10) * 10}m`;
}

export function StationAmenitiesList({ amenities }: { amenities: StationAmenity[] }) {
  if (amenities.length === 0) {
    return <p className="text-[14px] text-secondaryText text-center py-8">no amenities listed nearby</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {amenities.map((amenity) => {
        const Icon = amenity.icon;
        return (
          <div
            key={amenity.id}
            className="flex items-center gap-2.5 rounded-card bg-surfaceRaised border border-border px-3 py-2.5"
          >
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary">
              <Icon size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] text-text font-medium capitalize truncate">{amenity.label}</p>
              <p className="text-[12px] text-secondaryText">{formatDistance(amenity.distanceM)} away</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
