import { createContext, useContext } from "react";
import type { ExperimentConfig } from "../types/charging";

export interface ExperimentContextValue {
  config: ExperimentConfig;
  setConfig: (partial: Partial<ExperimentConfig>) => void;
  resetConfig: () => void;
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
}

export const ExperimentContext = createContext<ExperimentContextValue | null>(null);

export function useExperiments(): ExperimentContextValue {
  const ctx = useContext(ExperimentContext);
  if (!ctx) {
    throw new Error("useExperiments must be used within ExperimentProvider");
  }
  return ctx;
}
