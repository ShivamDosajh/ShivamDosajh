import { useEffect, useState } from "react";
import { Car, Clock, Milestone, Plug, UtensilsCrossed } from "lucide-react";
import type { Station } from "../../types/charging";
import { BottomSheet } from "../common/BottomSheet";
import { Button } from "../common/Button";
import { CpoLogo } from "../common/CpoLogo";
import { Rating } from "../common/Rating";
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
        {config.showPaymentStatusBanner && <PaymentStatus status={station.paymentStatus} />}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[14px] text-secondaryText">{station.cpo}</p>
            <h2 className="text-[18px] font-semibold leading-snug mt-0.5">{station.name}</h2>
            <p className="text-[14px] text-secondaryText mt-1 leading-relaxed">{station.address}</p>
            {config.showMegaChargerBadge && station.isMegaCharger && (
              <span className="inline-block mt-2 text-[12px] font-semibold text-orange-400 bg-orange-400/15 px-2 py-1 rounded-pill">
                TATA.ev Mega Charger
              </span>
            )}
          </div>
          <CpoLogo cpo={station.cpo} />
        </div>

        <div className="flex items-center justify-between text-[14px]">
          <div className="flex items-center gap-1.5">
            <span className="text-primary font-medium">ev rating</span>
            <Rating value={station.rating} />
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

        <div className="flex items-stretch">
          <div className="flex-1 flex items-center gap-2 pr-2">
            <Milestone size={24} className="text-text shrink-0" />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold leading-5 lowercase">distance</p>
              <p className="text-[14px] leading-5 text-secondaryText">{station.distance} km</p>
            </div>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 flex items-center gap-2 px-2">
            <Car size={24} className="text-text shrink-0" />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold leading-5 lowercase">ETA</p>
              <p className="text-[14px] leading-5 text-secondaryText">{station.eta} mins</p>
            </div>
          </div>
          {config.showStationLastUsed && (
            <>
              <div className="w-px bg-border" />
              <div className="flex-1 flex items-center gap-2 pl-2">
                <Clock size={24} className="text-text shrink-0" />
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold leading-5 lowercase">last used</p>
                  <p className="text-[14px] leading-5 text-secondaryText">{formatLastUsed(station.lastUsedMinutesAgo)}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {Array.from(new Set(station.chargers.map((c) => c.power)))
            .sort((a, b) => a - b)
            .map((power) => {
              const group = station.chargers.filter((c) => c.power === power);
              const availableCount = group.filter((c) => c.available).length;
              return (
                <div key={power} className="flex flex-col items-center gap-1">
                  <Plug size={24} className="text-text" />
                  <span className="text-[12px] leading-4 text-text">
                    {power.toFixed(1)}kW <span className="text-success">{availableCount}/{group.length}</span>
                  </span>
                </div>
              );
            })}
        </div>

        {config.showRangePrediction && (
          <RangePrediction currentRange={station.currentRangeKm} arrivalRange={station.arrivalRangeKm} />
        )}

        {/* Tabs: each panel shows only its own content — the overview tab is the actual
            gun picker (glowing to draw the eye), open by default so it's visible the moment
            the sheet opens, without needing to drag it up first. */}
        <StationTabs active={tab} onChange={setTab} />

        {tab === "overview" && (
          <>
            <GunQuickSelectList chargers={station.chargers} selectedId={selectedChargerId} onSelect={onSelectGun} />
            {selectedGun && <ChargerWorkingPrompt key={selectedGun.id} station={station} charger={selectedGun} />}
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
                  <p className="text-[14px] text-text font-medium">{foodStopCta(config.foodStopWording)}</p>
                  <p className="text-[12px] text-secondaryText">arrives right when you get to the charger</p>
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
