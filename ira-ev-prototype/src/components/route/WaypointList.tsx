import { useState } from "react";
import { Plus, X, MapPinned } from "lucide-react";
import { getLocationById } from "../../data/routeLocations";
import { LocationPickerModal } from "./LocationPickerModal";

interface WaypointListProps {
  waypointIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  excludeIds: string[];
}

export function WaypointList({ waypointIds, onAdd, onRemove, excludeIds }: WaypointListProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {waypointIds.map((id) => {
        const loc = getLocationById(id);
        if (!loc) return null;
        return (
          <div
            key={id}
            className="flex items-center gap-3 rounded-card bg-surfaceRaised border border-border px-3.5 py-2.5"
          >
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shrink-0 text-warning">
              <MapPinned size={14} />
            </div>
            <p className="text-[14px] text-text flex-1 truncate">{loc.label}</p>
            <button
              onClick={() => onRemove(id)}
              aria-label={`Remove ${loc.label}`}
              className="w-8 h-8 flex items-center justify-center rounded-full text-secondaryText active:bg-background shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}

      <button
        onClick={() => setPickerOpen(true)}
        className="flex items-center gap-2 text-primary text-[14px] font-medium py-2 min-h-[44px]"
      >
        <Plus size={16} />
        add stop
      </button>

      <LocationPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onAdd}
        title="Add a stop"
        excludeIds={[...excludeIds, ...waypointIds]}
      />
    </div>
  );
}
