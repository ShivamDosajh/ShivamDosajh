import { useState, type ReactNode } from "react";
import { History, MessageSquareText } from "lucide-react";
import { StationMapScreen } from "./screens/StationMap/StationMapScreen";
import { RoutesTabScreen } from "./screens/Routes/RoutesTabScreen";
import { StationDetailsSheet } from "./components/station/StationDetailsSheet";
import { ChargerSelectionScreen } from "./screens/ChargerSelection/ChargerSelectionScreen";
import { ChargingTypeScreen } from "./screens/ChargingType/ChargingTypeScreen";
import { RechargeCalculationScreen } from "./screens/RechargeCalculation/RechargeCalculationScreen";
import { PaymentProcessingScreen } from "./screens/Payment/PaymentProcessingScreen";
import { PaymentSuccessScreen } from "./screens/Payment/PaymentSuccessScreen";
import { SimplifiedChargeScreen } from "./screens/Simplified/SimplifiedChargeScreen";
import { QuickPayScreen } from "./screens/Payment/QuickPayScreen";
import { NavigatingScreen } from "./screens/Placeholder/NavigatingScreen";
import { PlaceholderScreen } from "./screens/Placeholder/PlaceholderScreen";
import { BottomNavigation, type BottomTab } from "./components/navigation/BottomNavigation";
import { ExperimentPanel } from "./components/experiments/ExperimentPanel";
import { PushNotificationBanner } from "./components/oneclick/PushNotificationBanner";
import { useChargingFlow } from "./hooks/useChargingFlow";
import { useExperiments } from "./hooks/useExperiments";
import { useZomatoOrder } from "./hooks/useZomatoOrder";
import { useWallet } from "./hooks/useWallet";
import { getStationById } from "./data/stations";
import { routeStationId, routeConnectorId } from "./utils/routeChargerBridge";

function AppShell() {
  const [tab, setTab] = useState<BottomTab>("station");
  // Backing out of a route-planner-originated charging session returns to the Routes tab
  // rather than surfacing the (unrelated) station map underneath it.
  const flow = useChargingFlow(() => setTab("routes"));
  const { config } = useExperiments();
  const { clearOrder } = useZomatoOrder();
  const wallet = useWallet();

  const handleResetPrototype = () => {
    flow.reset();
    clearOrder();
    wallet.resetWallet();
    setTab("station");
  };

  const handleSelectCharger = () => {
    if (config.simplifiedChargingFlow && flow.selectedStationId) {
      flow.startSimplifiedFlow(flow.selectedStationId);
    } else if (flow.selectedChargerId) {
      // A gun was already picked directly from the station card's overview tab — skip the
      // separate charger-selection screen and go straight to configuring the charge.
      flow.confirmChargerSelection();
    } else {
      flow.goToChargerSelection();
    }
  };

  // Tapping a gun in the station card's overview tab (short or long card) selects it, and
  // with quick-pay on, jumps straight to the combined charge-type + payment screen — no
  // separate charger-selection step either way.
  const handleOverviewSelectCharger = (chargerId: string) => {
    flow.selectCharger(chargerId);
    if (config.quickPayFlow) {
      flow.goTo("quick-pay");
    }
  };

  // Tapping the simulated push notification jumps straight to the one-tap quick-charge
  // screen for the verified station+charger, wherever in the app the driver currently is.
  const handleOpenOneClickNotification = (stationId: string, chargerId: string) => {
    flow.startChargingSession(stationId, chargerId, "quick-pay", false);
    setTab("station");
  };

  // A route-planner stop always has exactly one connector, so there's no real choice to
  // make on the gun-selection screen — but it still shows (pre-selected, one tap through)
  // rather than being skipped, so the driver sees the same connector/power confirmation
  // step they'd get charging from the station map directly. Pre-filled with the amount the
  // route plan already calculated for this stop rather than defaulting to a full charge.
  const handleStartChargingFromRoute = (routeChargerId: string, prefill: { units: number; amount: number }) => {
    flow.startChargingSession(
      routeStationId(routeChargerId),
      routeConnectorId(routeChargerId),
      "charger-selection",
      true
    );
    flow.setChargeType("amount");
    flow.setUnits(prefill.units);
    flow.setAmount(prefill.amount);
    setTab("station");
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
    case "quick-pay":
      flowScreen = <QuickPayScreen flow={flow} />;
      break;
    default:
      flowScreen = null;
  }

  return (
    <div className="h-app-shell w-full flex flex-col bg-background text-text overflow-hidden">
      {/* Kept mounted (hidden via CSS, not unmounted) whenever another tab is active, so the
          route planner's itinerary — including scroll position — survives jumping away to
          charge a stop and coming back, instead of resetting to a blank setup screen. */}
      <div className={`flex-1 min-h-0 flex-col ${tab === "routes" ? "flex" : "hidden"}`}>
        <RoutesTabScreen onExit={() => setTab("station")} onStartCharging={handleStartChargingFromRoute} />
        <BottomNavigation active={tab} onChange={setTab} />
      </div>

      {tab === "history" && (
        <div className="flex-1 min-h-0 flex flex-col">
          <PlaceholderScreen icon={History} title="history" description="Your past charging sessions will appear here." />
          <BottomNavigation active={tab} onChange={setTab} />
        </div>
      )}
      {tab === "feedback" && (
        <div className="flex-1 min-h-0 flex flex-col">
          <PlaceholderScreen icon={MessageSquareText} title="feedback" description="Share feedback on your charging experience." />
          <BottomNavigation active={tab} onChange={setTab} />
        </div>
      )}

      <div className={`flex-1 min-h-0 flex-col relative ${tab === "station" ? "flex" : "hidden"}`}>
        <div className="flex-1 min-h-0 relative">
          <StationMapScreen flow={flow} />

          {flow.step === "station-details" && (
            <StationDetailsSheet
              station={getStationById(flow.selectedStationId)}
              selectedChargerId={flow.selectedChargerId}
              onClose={flow.closeStationDetails}
              onNavigate={flow.goToNavigation}
              onSelectCharger={handleSelectCharger}
              onSelectGun={handleOverviewSelectCharger}
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

      <ExperimentPanel onResetPrototype={handleResetPrototype} />
      <PushNotificationBanner onOpen={handleOpenOneClickNotification} />
    </div>
  );
}

export default AppShell;
