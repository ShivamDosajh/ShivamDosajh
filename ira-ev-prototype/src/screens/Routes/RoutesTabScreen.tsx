import { useState } from "react";
import { useExperiments } from "../../hooks/useExperiments";
import { useRoutePlanner } from "../../hooks/useRoutePlanner";
import { useLegByLegPlanner } from "../../hooks/useLegByLegPlanner";
import { RouteNavigatingScreen } from "../../components/route/RouteNavigatingScreen";
import { RouteSetupScreen } from "./RouteSetupScreen";
import { RouteResultsScreen } from "./RouteResultsScreen";
import { LegByLegSetupScreen } from "./LegByLegSetupScreen";
import { LegByLegBuildScreen } from "./LegByLegBuildScreen";

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
function LegByLegRoutesFlow({ onExit }: { onExit: () => void }) {
  const planner = useLegByLegPlanner();
  const [navigating, setNavigating] = useState(false);

  if (navigating && planner.plan) {
    return <RouteNavigatingScreen destinationLabel={planner.plan.destinationLabel} onEnd={() => setNavigating(false)} />;
  }

  if (planner.step !== "setup") {
    return <LegByLegBuildScreen planner={planner} onBack={planner.editTrip} onStartNavigation={() => setNavigating(true)} />;
  }

  return <LegByLegSetupScreen planner={planner} onBack={onExit} />;
}

export function RoutesTabScreen({ onExit, onStartCharging }: RoutesTabScreenProps) {
  const { config } = useExperiments();

  if (config.legByLegRoutePlanner) {
    return <LegByLegRoutesFlow onExit={onExit} />;
  }

  return <ClassicRoutesFlow onExit={onExit} onStartCharging={onStartCharging} />;
}
