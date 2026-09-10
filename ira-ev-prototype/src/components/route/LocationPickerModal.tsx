import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Modal } from "../common/Modal";
import { searchLocations } from "../../data/routeLocations";

interface LocationPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  title: string;
  excludeIds?: string[];
}

export function LocationPickerModal({ open, onClose, onSelect, title, excludeIds = [] }: LocationPickerModalProps) {
  const [query, setQuery] = useState("");
  const results = searchLocations(query).filter((l) => !excludeIds.includes(l.id));

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex items-center gap-2 bg-surfaceRaised border border-border rounded-button h-11 px-3 mb-3 -mt-1">
        <Search size={16} className="text-secondaryText shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search city or region"
          className="bg-transparent outline-none border-none text-text placeholder:text-secondaryText w-full text-[14px]"
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-1">
        {results.map((loc) => (
          <button
            key={loc.id}
            onClick={() => {
              onSelect(loc.id);
              onClose();
              setQuery("");
            }}
            className="flex items-center gap-3 px-2 py-3 rounded-button min-h-[44px] active:bg-surfaceRaised text-left"
          >
            <div className="w-9 h-9 rounded-full bg-surfaceRaised flex items-center justify-center shrink-0">
              <MapPin size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-[14px] text-text font-medium">{loc.label}</p>
              <p className="text-[12px] text-secondaryText">{loc.region}</p>
            </div>
          </button>
        ))}
        {results.length === 0 && (
          <p className="text-[13px] text-secondaryText text-center py-6">no matching locations</p>
        )}
      </div>
    </Modal>
  );
}
