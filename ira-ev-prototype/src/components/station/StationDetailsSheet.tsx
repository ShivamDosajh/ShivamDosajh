import { useEffect, useState } from "react";
import { Star, UtensilsCrossed } from "lucide-react";
import type { Station } from "../../types/charging";
import { BottomSheet } from "../common/BottomSheet";
import { Button } from "../common/Button";
import { CpoLogo } from "../common/CpoLogo";
import { PaymentStatus } from "./PaymentStatus";
import { RangePrediction } from "./RangePrediction";
import { StationTabs } from "./StationTabs";
import { GunQuickSelectList } from "./GunQuickSelectList";
import { GunConnectPrompt } from "../oneclick/GunConnectPrompt";
import { ChargerWorkingPrompt } from "./ChargerWorkingPrompt";
import { StationReviewsList } from "./StationReviewsList";
import { StationAmenitiesList } from "./StationAmenitiesList";
import { StationPhotoCarousel } from "./StationPhotoCarousel";
import { useExperiments } from "../../hooks/useExperiments";
import { useSheetDrag } from "../../hooks/useSheetDrag";
import { useZomatoOrder } from "../../hooks/useZomatoOrder";
import { getReviewsForStation } from "../../data/reviews";
import { getAmenitiesForStation } from "../../data/amenities";
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
  /** Tapping a gun in the overview tab — selects it, and with quick-pay on, jumps straight to
   * the payment screen instead of waiting for the footer button. */
  onSelectGun: (chargerId: string) => void;
}

const COLLAPSED_VH = 90;
const EXPANDED_VH = 98;

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
  const [tab, setTab] = useState<"overview" | "reviews" | "amenities">("overview");
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
  const amenities = getAmenitiesForStation(station.id);
  const amenityIcons = amenities.slice(0, 3);
  const zomatoRestaurants = getZomatoRestaurantsForStation(station.id);
  const zomatoAvailable = config.showZomatoOrdering && zomatoRestaurants.length > 0;
  const selectedGun = station.chargers.find((c) => c.id === selectedChargerId) ?? null;

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
      <div className="flex flex-col gap-3 pb-2">
        {/* Common area: identifying info the driver needs regardless of which tab is open. */}
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

        <div className="flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-1.5">
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
          {amenityIcons.length > 0 && (
            <div className="flex items-center gap-2.5 text-secondaryText">
              {amenityIcons.map((amenity) => {
                const AmenityIcon = amenity.icon;
                return <AmenityIcon key={amenity.id} size={16} />;
              })}
            </div>
          )}
        </div>

        <StationPhotoCarousel stationId={station.id} />

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

        {config.showRangePrediction && (
          <RangePrediction currentRange={station.currentRangeKm} arrivalRange={station.arrivalRangeKm} />
        )}

        <ChargerWorkingPrompt station={station} />

        {/* Tabs: each panel shows only its own content — the overview tab is the actual
            gun picker (glowing to draw the eye), open by default so it's visible the moment
            the sheet opens, without needing to drag it up first. */}
        <StationTabs active={tab} onChange={setTab} />

        {tab === "overview" && (
          <>
            <GunQuickSelectList chargers={station.chargers} selectedId={selectedChargerId} onSelect={onSelectGun} />
            {config.oneClickCharging && selectedGun && (
              <GunConnectPrompt
                stationId={station.id}
                stationName={station.name}
                chargerId={selectedGun.id}
                chargerLabel={`${selectedGun.connector}(${selectedGun.name})`}
              />
            )}
          </>
        )}
        {tab === "reviews" && <StationReviewsList reviews={reviews} />}
        {tab === "amenities" && <StationAmenitiesList amenities={amenities} />}

        {zomatoAvailable && (
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
        restaurants={zomatoRestaurants}
        arrivalLabel={`~${station.eta} min`}
        chargerSubtitle={
          station.chargers[0] ? `${station.cpo} · ${station.chargers[0].connector} · ${station.chargers[0].power}kW` : undefined
        }
      />
    </BottomSheet>
  );
}
