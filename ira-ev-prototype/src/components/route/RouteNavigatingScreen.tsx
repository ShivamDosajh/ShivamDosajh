import { Navigation2 } from "lucide-react";
import { Button } from "../common/Button";

export function RouteNavigatingScreen({ destinationLabel, onEnd }: { destinationLabel: string; onEnd: () => void }) {
  return (
    <div className="flex flex-col h-full items-center justify-center gap-5 px-6 text-center safe-top safe-bottom">
      <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center animate-pulse">
        <Navigation2 size={28} className="text-primary" />
      </div>
      <div>
        <p className="text-[16px] font-medium">navigating to {destinationLabel}</p>
        <p className="text-[12px] text-secondaryText mt-3">(mock navigation preview — turn-by-turn with live charger status would appear here)</p>
      </div>
      <div className="w-full max-w-xs">
        <Button variant="outline" onClick={onEnd}>
          end navigation
        </Button>
      </div>
    </div>
  );
}
