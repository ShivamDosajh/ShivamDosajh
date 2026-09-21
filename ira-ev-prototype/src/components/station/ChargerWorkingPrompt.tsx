import { useState } from "react";
import { HelpCircle, ThumbsUp, ThumbsDown, X, CheckCircle2, AlertTriangle } from "lucide-react";
import type { Charger, Station } from "../../types/charging";
import { useChargerReports } from "../../hooks/useChargerReports";

interface ChargerWorkingPromptProps {
  station: Station;
  /** The specific gun/connector this report is about — reports are always scoped to one
   * gun, never the whole station, since other guns at the same station can be fine. */
  charger: Charger;
}

/** A driver more than this from a charger can't have just tried it, so their answer
 * wouldn't be a real report — only ask when they're actually close enough to know. */
const NEARBY_REPORT_RADIUS_KM = 2;
/** Enough independent reports to treat "not working" as a real signal worth surfacing to
 * other drivers, rather than one person's bad connector or a mis-tap. */
const ISSUE_REPORT_THRESHOLD = 3;

type PromptState = "prompting" | "dismissed" | "reported";

/**
 * A small crowd-sourced status check for one specific gun, shown only for chargers close
 * enough that the driver could plausibly have just tried it. Once enough drivers have
 * reported a gun as not working, everyone else nearby sees a warning banner ahead of
 * choosing that gun — independently of whether they've submitted their own report yet.
 */
export function ChargerWorkingPrompt({ station, charger }: ChargerWorkingPromptProps) {
  const [state, setState] = useState<PromptState>("prompting");
  const [answer, setAnswer] = useState<"working" | "not-working" | null>(null);
  const { counts, submitReport } = useChargerReports(charger.id);

  if (station.distance > NEARBY_REPORT_RADIUS_KM || state === "dismissed") return null;

  const hasIssueReports = counts.notWorking >= ISSUE_REPORT_THRESHOLD;

  const handleReport = (working: boolean) => {
    submitReport(working);
    setAnswer(working ? "working" : "not-working");
    setState("reported");
  };

  return (
    <div className="flex flex-col gap-2 mt-2.5">
      {hasIssueReports && (
        <div className="flex items-center gap-3 rounded-card bg-surfaceRaised shadow-md pl-2 pr-4 py-2">
          <AlertTriangle size={32} className="text-warning shrink-0" />
          <p className="font-action font-medium text-[14px] leading-5 text-text">
            {counts.notWorking} drivers reported this charger isn't working
          </p>
        </div>
      )}

      {state === "reported" ? (
        <div className="flex items-center gap-3 rounded-card bg-surfaceRaised shadow-md pl-2 pr-4 py-2">
          <CheckCircle2 size={32} className="text-success shrink-0" />
          <p className="font-action font-medium text-[14px] leading-5 text-text">
            thanks — reported as {answer === "working" ? "working" : "not working"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-card bg-surfaceRaised shadow-md pl-2 pr-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-3 font-action font-medium text-[14px] leading-5 text-text">
              <HelpCircle size={32} className="text-primary shrink-0" />
              is this charger working?
            </p>
            <button onClick={() => setState("dismissed")} className="text-secondaryText shrink-0 p-1 -m-1" aria-label="dismiss">
              <X size={16} />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleReport(true)}
              className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-button bg-success/15 text-success text-[12px] font-medium"
            >
              <ThumbsUp size={12} />
              yes
            </button>
            <button
              onClick={() => handleReport(false)}
              className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-button bg-error/15 text-error text-[12px] font-medium"
            >
              <ThumbsDown size={12} />
              not working
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
