import { useState, type ReactNode } from "react";
import { Map, History, MessageSquareText } from "lucide-react";
import { StationMapScreen } from "./screens/StationMap/StationMapScreen";
import { StationDetailsSheet } from "./components/station/StationDetailsSheet";
import { ChargerSelectionScreen } from "./screens/ChargerSelection/ChargerSelectionScreen";
import { ChargingTypeScreen } from "./screens/ChargingType/ChargingTypeScreen";
import { RechargeCalculationScreen } from "./screens/RechargeCalculation/RechargeCalculationScreen";
import { PaymentProcessingScreen } from "./screens/Payment/PaymentProcessingScreen";
import { PaymentSuccessScreen } from "./screens/Payment/PaymentSuccessScreen";
import { SimplifiedChargeScreen } from "./screens/Simplified/SimplifiedChargeScreen";
import { NavigatingScreen } from "./screens/Placeholder/NavigatingScreen";
import { PlaceholderScreen } from "./screens/Placeholder/PlaceholderScreen";
import { BottomNavigation, type BottomTab } from "./components/navigation/BottomNavigation";
import { ExperimentPanel } from "./components/experiments/ExperimentPanel";
import { useChargingFlow } from "./hooks/useChargingFlow";
import { useExperiments } from "./hooks/useExperiments";
import { getStationById } from "./data/stations";

function AppShell() {
  const flow = useChargingFlow();
  const { config } = useExperiments();
  const [tab, setTab] = useState<BottomTab>("station");

  const handleResetPrototype = () => {
    flow.reset();
    setTab("station");
  };

  const handleSelectCharger = () => {
    if (config.simplifiedChargingFlow && flow.selectedStationId) {
      flow.startSimplifiedFlow(flow.selectedStationId);
    } else {
      flow.goToChargerSelection();
    }
  };

  const showChargingFlowScreen =
    flow.step !== "map" && flow.step !== "station-details" && flow.step !== "navigating";

  const showBottomNav = flow.step === "map" && tab === "station";

  let flowScreen: ReactNode = null;
  switch (flow.step) {
    case "charger-selection":
      flowScreen = <ChargerSelectionScreen flow={flow} />;
      break;
    case "charging-type":
      flowScreen = <ChargingTypeScreen flow={flow} />;
      break;
    case "recharge-calculation":
      flowScreen = <RechargeCalculationScreen flow={flow} />;
      break;
    case "payment-processing":
      flowScreen = <PaymentProcessingScreen flow={flow} />;
      break;
    case "payment-success":
      flowScreen = <PaymentSuccessScreen flow={flow} />;
      break;
    case "simplified-charge":
      flowScreen = <SimplifiedChargeScreen flow={flow} />;
      break;
    default:
      flowScreen = null;
  }

  return (
    <div className="h-dvh w-full flex flex-col bg-background text-text overflow-hidden">
      {tab !== "station" && (
        <div className="flex-1 min-h-0 flex flex-col">
          {tab === "routes" && (
            <PlaceholderScreen icon={Map} title="routes" description="Route planning with charging stops is coming soon in this prototype." />
          )}
          {tab === "history" && (
            <PlaceholderScreen icon={History} title="history" description="Your past charging sessions will appear here." />
          )}
          {tab === "feedback" && (
            <PlaceholderScreen icon={MessageSquareText} title="feedback" description="Share feedback on your charging experience." />
          )}
          <BottomNavigation active={tab} onChange={setTab} />
        </div>
      )}

      {tab === "station" && (
        <div className="flex-1 min-h-0 flex flex-col relative">
          <div className="flex-1 min-h-0 relative">
            <StationMapScreen flow={flow} />

            {flow.step === "station-details" && (
              <StationDetailsSheet
                station={getStationById(flow.selectedStationId)}
                onClose={flow.closeStationDetails}
                onNavigate={flow.goToNavigation}
                onSelectCharger={handleSelectCharger}
              />
            )}
          </div>

          {showBottomNav && <BottomNavigation active={tab} onChange={setTab} />}

          {flow.step === "navigating" && (
            <div className="absolute inset-0 z-30 bg-background animate-fade-in">
              <NavigatingScreen flow={flow} />
            </div>
          )}

          {showChargingFlowScreen && (
            <div className="absolute inset-0 z-30 bg-background animate-slide-in">{flowScreen}</div>
          )}
        </div>
      )}

      <ExperimentPanel onResetPrototype={handleResetPrototype} />
    </div>
  );
}

export default AppShell;
