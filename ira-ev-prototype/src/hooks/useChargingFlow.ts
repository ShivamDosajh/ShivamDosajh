import { useCallback, useMemo, useState } from "react";
import type { ChargeType, ChargingFlowState, FlowStep } from "../types/charging";

const initialState: ChargingFlowState = {
  step: "map",
  history: [],
  selectedStationId: null,
  selectedChargerId: null,
  chargeType: null,
  amount: null,
  units: null,
  selectedPaymentMethodId: null,
};

export interface ChargingFlowApi extends ChargingFlowState {
  goTo: (step: FlowStep) => void;
  back: () => void;
  selectStation: (stationId: string) => void;
  closeStationDetails: () => void;
  goToChargerSelection: () => void;
  selectCharger: (chargerId: string) => void;
  confirmChargerSelection: () => void;
  setChargeType: (type: ChargeType) => void;
  setAmount: (amount: number | null) => void;
  setUnits: (units: number | null) => void;
  confirmChargingType: () => void;
  selectPaymentMethod: (methodId: string) => void;
  startPayment: () => void;
  completePayment: () => void;
  startSimplifiedFlow: (stationId: string) => void;
  goToNavigation: () => void;
  reset: () => void;
  canGoBack: boolean;
}

export function useChargingFlow(): ChargingFlowApi {
  const [state, setState] = useState<ChargingFlowState>(initialState);

  const goTo = useCallback((step: FlowStep) => {
    setState((prev) => ({ ...prev, history: [...prev.history, prev.step], step }));
  }, []);

  const back = useCallback(() => {
    setState((prev) => {
      if (prev.history.length === 0) return prev;
      const history = [...prev.history];
      const previousStep = history.pop() as FlowStep;
      return { ...prev, history, step: previousStep };
    });
  }, []);

  const selectStation = useCallback(
    (stationId: string) => {
      setState((prev) => ({
        ...prev,
        history: [...prev.history, prev.step],
        step: "station-details",
        selectedStationId: stationId,
      }));
    },
    []
  );

  const closeStationDetails = useCallback(() => {
    setState((prev) => ({
      ...prev,
      history: [...prev.history, prev.step],
      step: "map",
      selectedStationId: null,
    }));
  }, []);

  const goToChargerSelection = useCallback(() => {
    goTo("charger-selection");
  }, [goTo]);

  const selectCharger = useCallback((chargerId: string) => {
    setState((prev) => ({ ...prev, selectedChargerId: chargerId }));
  }, []);

  const confirmChargerSelection = useCallback(() => {
    goTo("charging-type");
  }, [goTo]);

  const setChargeType = useCallback((type: ChargeType) => {
    setState((prev) => ({ ...prev, chargeType: type }));
  }, []);

  const setAmount = useCallback((amount: number | null) => {
    setState((prev) => ({ ...prev, amount }));
  }, []);

  const setUnits = useCallback((units: number | null) => {
    setState((prev) => ({ ...prev, units }));
  }, []);

  const confirmChargingType = useCallback(() => {
    goTo("recharge-calculation");
  }, [goTo]);

  const selectPaymentMethod = useCallback((methodId: string) => {
    setState((prev) => ({ ...prev, selectedPaymentMethodId: methodId }));
  }, []);

  const startPayment = useCallback(() => {
    goTo("payment-processing");
  }, [goTo]);

  const completePayment = useCallback(() => {
    setState((prev) => ({ ...prev, history: [...prev.history, prev.step], step: "payment-success" }));
  }, []);

  const startSimplifiedFlow = useCallback((stationId: string) => {
    setState((prev) => ({
      ...prev,
      history: [...prev.history, prev.step],
      step: "simplified-charge",
      selectedStationId: stationId,
    }));
  }, []);

  const goToNavigation = useCallback(() => {
    goTo("navigating");
  }, [goTo]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const canGoBack = state.history.length > 0;

  return useMemo(
    () => ({
      ...state,
      goTo,
      back,
      selectStation,
      closeStationDetails,
      goToChargerSelection,
      selectCharger,
      confirmChargerSelection,
      setChargeType,
      setAmount,
      setUnits,
      confirmChargingType,
      selectPaymentMethod,
      startPayment,
      completePayment,
      startSimplifiedFlow,
      goToNavigation,
      reset,
      canGoBack,
    }),
    [
      state,
      goTo,
      back,
      selectStation,
      closeStationDetails,
      goToChargerSelection,
      selectCharger,
      confirmChargerSelection,
      setChargeType,
      setAmount,
      setUnits,
      confirmChargingType,
      selectPaymentMethod,
      startPayment,
      completePayment,
      startSimplifiedFlow,
      goToNavigation,
      reset,
      canGoBack,
    ]
  );
}
