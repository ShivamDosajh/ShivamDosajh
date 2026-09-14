import { useEffect, useState } from "react";
import { Star, Phone, Navigation2, UtensilsCrossed } from "lucide-react";
import type { Station } from "../../types/charging";
import { BottomSheet } from "../common/BottomSheet";
import { Button } from "../common/Button";
import { CpoLogo } from "../common/CpoLogo";
import { IconAction } from "../common/IconAction";
import { PaymentStatus } from "./PaymentStatus";
import { RangePrediction } from "./RangePrediction";
import { StationTabs } from "./StationTabs";
import { GunQuickSelectList } from "./GunQuickSelectList";
import { StationReviewsList } from "./StationReviewsList";
import { useExperiments } from "../../hooks/useExperiments";
import { useSheetDrag } from "../../hooks/useSheetDrag";
import { useZomatoOrder } from "../../hooks/useZomatoOrder";
import { getReviewsForStation } from "../../data/reviews";
import { getZomatoRestaurantsForStation } from "../../data/zomatoRestaurants";
import { foodStopCta } from "../../utils/foodStopWording";
import { ZomatoOrderFlow } from "../zomato/ZomatoOrderFlow";
import { ZomatoOrderStatusCard } from "../zomato/ZomatoOrderStatusCard";

interface StationDetailsSheetProps {
  station: Station | undefined;
  selectedChargerId: string | null;
  onClose: () => void;
  onNavigate: () => void;
  onSelectCharger: () => void;
  /** Tapping a gun directly in the overview tab — selects it, and with quick-pay on, jumps
   * straight to the payment screen instead of waiting for the footer button. */
  onSelectGun: (chargerId: string) => void;
}

const COLLAPSED_VH = 64;
const EXPANDED_VH = 92;

function formatLastUsed(minutes: number | null): string {
  if (minutes === null) return "not used yet";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hr ago`;
}

export function StationDetailsSheet({
  station,
  selectedChargerId,
  onClose,
  onNavigate,
  onSelectCharger,
  onSelectGun,
}: StationDetailsSheetProps) {
  const { config } = useExperiments();
  const { order, clearOrder } = useZomatoOrder();
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<"overview" | "reviews">("overview");
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const { heightPx, isDragging, visualExpanded, handleProps } = useSheetDrag({
    collapsedVh: COLLAPSED_VH,
    expandedVh: EXPANDED_VH,
    expanded,
    onExpandedChange: setExpanded,
    onDismiss: onClose,
  });

  // Reset per-station UI state whenever a different station sheet opens.
  useEffect(() => {
    setExpanded(false);
    setTab("overview");
  }, [station?.id]);

  if (!station) return null;

  const reviews = getReviewsForStation(station.id, station.rating);

  return (
    <BottomSheet
      open={!!station}
      onClose={onClose}
      heightPx={heightPx}
      isDragging={isDragging}
      dragHandleProps={handleProps}
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={visualExpanded ? () => setExpanded(false) : onNavigate}>
            {visualExpanded ? "check in" : "navigate"}
          </Button>
          {!config.quickPayFlow && (
            <Button variant="primary" onClick={onSelectCharger}>
              {selectedChargerId && !config.simplifiedChargingFlow ? "continue" : "select charger"}
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4 pb-2">
        <PaymentStatus status={station.paymentStatus} />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] text-secondaryText">{station.cpo}</p>
            <h2 className="text-[19px] font-semibold leading-snug mt-0.5">{station.name}</h2>
            <p className="text-[13px] text-secondaryText mt-1 leading-relaxed">{station.address}</p>
            {config.showMegaChargerBadge && station.isMegaCharger && (
              <span className="inline-block mt-2 text-[11px] font-semibold text-orange-400 bg-orange-400/15 px-2 py-1 rounded-pill">
                TATA.ev Mega Charger
              </span>
            )}
          </div>
          <CpoLogo cpo={station.cpo} />
        </div>

        {/* Overview (every gun, tap to pick — glowing to draw the eye) and reviews sit right
            after the header, before anything else, so the guns are visible on the short card
            without needing to scroll or expand it first. */}
        <StationTabs active={tab} onChange={setTab} />

        {tab === "overview" ? (
          <GunQuickSelectList chargers={station.chargers} selectedId={selectedChargerId} onSelect={onSelectGun} />
        ) : (
          <StationReviewsList reviews={reviews} />
        )}

        {!visualExpanded && (
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="text-primary font-medium">ev rating</span>
            <span className="text-secondaryText">
              {station.rating !== null ? (
                <span className="flex items-center gap-1 text-text">
                  <Star size={13} className="fill-warning text-warning" />
                  {station.rating.toFixed(1)}
                </span>
              ) : (
                "--"
              )}
            </span>
          </div>
        )}

        {!visualExpanded && (
          <div className="flex items-stretch justify-between rounded-card bg-surfaceRaised border border-border px-3 py-3">
            <div className="flex-1 text-center">
              <p className="text-[11px] text-secondaryText lowercase">distance</p>
              <p className="text-[14px] font-semibold mt-0.5">{station.distance} km</p>
            </div>
            <div className="w-px bg-border" />
            <div className="flex-1 text-center">
              <p className="text-[11px] text-secondaryText lowercase">ETA</p>
              <p className="text-[14px] font-semibold mt-0.5">{station.eta} mins</p>
            </div>
            {config.showStationLastUsed && (
              <>
                <div className="w-px bg-border" />
                <div className="flex-1 text-center">
                  <p className="text-[11px] text-secondaryText lowercase">last used</p>
                  <p className="text-[13px] font-semibold mt-0.5">{formatLastUsed(station.lastUsedMinutesAgo)}</p>
                </div>
              </>
            )}
          </div>
        )}

        {visualExpanded && config.showRangePrediction && (
          <RangePrediction currentRange={station.currentRangeKm} arrivalRange={station.arrivalRangeKm} />
        )}

        {visualExpanded && (
          <div className="flex items-stretch">
            <IconAction icon={Phone} label="call" onClick={() => {}} />
            <div className="w-px bg-border my-2" />
            <IconAction icon={Navigation2} label="navigate" onClick={onNavigate} />
          </div>
        )}

        {!visualExpanded && config.showRangePrediction && (
          <RangePrediction currentRange={station.currentRangeKm} arrivalRange={station.arrivalRangeKm} />
        )}

        {!visualExpanded && config.showEstimatedCost && (
          <p className="text-[12px] text-secondaryText">
            estimated cost from ₹{Math.min(...station.chargers.map((c) => c.pricePerKwh))}/kWh
          </p>
        )}

        {!visualExpanded && config.showZomatoOrdering && (
          <>
            {order && order.stationId === station.id ? (
              <ZomatoOrderStatusCard order={order} onDismiss={clearOrder} />
            ) : (
              <button
                onClick={() => setOrderModalOpen(true)}
                className="flex items-center gap-3 rounded-card border border-dashed border-primary/40 px-3.5 py-3 min-h-[44px] text-left"
              >
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary">
                  <UtensilsCrossed size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-text font-medium">{foodStopCta(config.foodStopWording)}</p>
                  <p className="text-[11px] text-secondaryText">arrives right when you get to the charger</p>
                </div>
              </button>
            )}
          </>
        )}
      </div>

      <ZomatoOrderFlow
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        stationId={station.id}
        stationName={station.name}
        restaurants={getZomatoRestaurantsForStation(station.id)}
        arrivalLabel={`~${station.eta} min`}
        chargerSubtitle={
          station.chargers[0] ? `${station.cpo} · ${station.chargers[0].connector} · ${station.chargers[0].power}kW` : undefined
        }
      />
    </BottomSheet>
  );
}
