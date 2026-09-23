import { useState } from "react";
import { useExperiments } from "../../hooks/useExperiments";
import { useRoutePlanner } from "../../hooks/useRoutePlanner";
import { useLegByLegPlanner } from "../../hooks/useLegByLegPlanner";
import { useAdvancedRoutePlanner } from "../../hooks/useAdvancedRoutePlanner";
import { RouteNavigatingScreen } from "../../components/route/RouteNavigatingScreen";
import { RouteSetupScreen } from "./RouteSetupScreen";
import { RouteResultsScreen } from "./RouteResultsScreen";
import { LegByLegSetupScreen } from "./LegByLegSetupScreen";
import { LegByLegBuildScreen } from "./LegByLegBuildScreen";
import { AdvancedTripInputsScreen } from "./AdvancedTripInputsScreen";
import { RouteOptionsScreen } from "./RouteOptionsScreen";
import { AdvancedLegPlannerScreen } from "./AdvancedLegPlannerScreen";
import { AdvancedTripSummaryScreen } from "./AdvancedTripSummaryScreen";
import { LiveTripScreen } from "./LiveTripScreen";

interface RoutesTabScreenProps {
  /** Leaves the Routes tab entirely (back to the map) — only reachable from the setup screen, since results has its own "edit trip" back-step. */
  onExit: () => void;
  onStartCharging: (routeChargerId: string, prefill: { units: number; amount: number }) => void;
}

/** The original route planner — one auto-optimized itinerary computed up front. */
function ClassicRoutesFlow({ onExit, onStartCharging }: RoutesTabScreenProps) {
  const planner = useRoutePlanner();
  const [navigating, setNavigating] = useState(false);

  if (navigating && planner.plan) {
    return <RouteNavigatingScreen destinationLabel={planner.plan.destinationLabel} onEnd={() => setNavigating(false)} />;
  }

  if (planner.step === "results" && planner.plan) {
    return (
      <RouteResultsScreen planner={planner} onStartNavigation={() => setNavigating(true)} onStartCharging={onStartCharging} />
    );
  }

  return <RouteSetupScreen planner={planner} onBack={onExit} />;
}

/** The leg-by-leg builder — the driver picks a charger for each leg one at a time. */
function LegByLegRoutesFlow({ onExit, onStartCharging }: RoutesTabScreenProps) {
  const planner = useLegByLegPlanner();
  const [navigating, setNavigating] = useState(false);

  if (navigating && planner.plan) {
    return <RouteNavigatingScreen destinationLabel={planner.plan.destinationLabel} onEnd={() => setNavigating(false)} />;
  }

  if (planner.step !== "setup") {
    return (
      <LegByLegBuildScreen
        planner={planner}
        onBack={planner.editTrip}
        onStartNavigation={() => setNavigating(true)}
        onStartCharging={onStartCharging}
      />
    );
  }

  return <LegByLegSetupScreen planner={planner} onBack={onExit} />;
}

/** PRD v2's "Advanced Route Planner" — route alternatives, then a guided leg-by-leg build with
 * 3 ranked charger recommendations per leg, a trip summary, and a live-trip screen. Front-end
 * only: reuses the same underlying physics/leg-splitting engine as the other two planners, with
 * mock badges (reliability, live guns, reviews) and a demo-only live-trip alert, per the request
 * to skip real algorithm/backend work. */
function AdvancedRoutePlannerV2Flow({ onExit }: { onExit: () => void }) {
  const planner = useAdvancedRoutePlanner();

  switch (planner.step) {
    case "options":
      return <RouteOptionsScreen planner={planner} onBack={planner.editTrip} />;
    case "legs":
      return <AdvancedLegPlannerScreen planner={planner} onBack={planner.editTrip} />;
    case "summary":
      return <AdvancedTripSummaryScreen planner={planner} onBack={planner.editTrip} />;
    case "live":
      return <LiveTripScreen planner={planner} onEnd={planner.editTrip} />;
    default:
      return <AdvancedTripInputsScreen planner={planner} onBack={onExit} />;
  }
}

export function RoutesTabScreen({ onExit, onStartCharging }: RoutesTabScreenProps) {
  const { config } = useExperiments();

  if (config.advancedRoutePlannerV2) {
    return <AdvancedRoutePlannerV2Flow onExit={onExit} />;
  }

  if (config.legByLegRoutePlanner) {
    return <LegByLegRoutesFlow onExit={onExit} onStartCharging={onStartCharging} />;
  }

  return <ClassicRoutesFlow onExit={onExit} onStartCharging={onStartCharging} />;
}
