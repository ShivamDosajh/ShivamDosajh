import { useState } from "react";
import { HelpCircle, ThumbsUp, ThumbsDown, X, CheckCircle2 } from "lucide-react";
import type { Station } from "../../types/charging";

interface ChargerWorkingPromptProps {
  station: Station;
}

/** A driver more than this from a charger can't have just tried it, so their answer
 * wouldn't be a real report — only ask when they're actually close enough to know. */
const NEARBY_REPORT_RADIUS_KM = 2;

type PromptState = "prompting" | "dismissed" | "reported";

/**
 * A small crowd-sourced status check on the station short card — only shown for chargers
 * close enough that the driver could plausibly have just tried it, since a report from
 * someone nowhere near the charger isn't a real signal.
 */
export function ChargerWorkingPrompt({ station }: ChargerWorkingPromptProps) {
  const [state, setState] = useState<PromptState>("prompting");
  const [answer, setAnswer] = useState<"working" | "not-working" | null>(null);

  if (station.distance > NEARBY_REPORT_RADIUS_KM || state === "dismissed") return null;

  if (state === "reported") {
    return (
      <div className="flex items-center gap-2 rounded-button bg-surfaceRaised border border-border px-3 py-2 mt-2.5">
        <CheckCircle2 size={13} className="text-success shrink-0" />
        <p className="text-[11px] text-secondaryText">
          thanks — reported as {answer === "working" ? "working" : "not working"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-button bg-primary/10 border border-primary/30 px-3 py-2.5 mt-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[12px] text-text font-medium">
          <HelpCircle size={13} className="text-primary shrink-0" />
          is this charger working?
        </p>
        <button onClick={() => setState("dismissed")} className="text-secondaryText shrink-0 p-1 -m-1" aria-label="dismiss">
          <X size={12} />
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            setAnswer("working");
            setState("reported");
          }}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-button bg-success/15 text-success text-[12px] font-medium"
        >
          <ThumbsUp size={12} />
          yes
        </button>
        <button
          onClick={() => {
            setAnswer("not-working");
            setState("reported");
          }}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-button bg-error/15 text-error text-[12px] font-medium"
        >
          <ThumbsDown size={12} />
          not working
        </button>
      </div>
    </div>
  );
}
