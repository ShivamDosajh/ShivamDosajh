import { useCallback, useMemo, useState, type ReactNode } from "react";
import { defaultExperimentConfig, EXPERIMENT_STORAGE_KEY } from "../../config/experiments";
import type { ExperimentConfig } from "../../types/charging";
import { ExperimentContext } from "../../hooks/useExperiments";

function loadStoredConfig(): ExperimentConfig {
  try {
    const raw = localStorage.getItem(EXPERIMENT_STORAGE_KEY);
    if (!raw) return defaultExperimentConfig;
    const parsed = JSON.parse(raw);
    return { ...defaultExperimentConfig, ...parsed };
  } catch {
    return defaultExperimentConfig;
  }
}

export function ExperimentProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<ExperimentConfig>(loadStoredConfig);
  const [panelOpen, setPanelOpen] = useState(false);

  const setConfig = useCallback((partial: Partial<ExperimentConfig>) => {
    setConfigState((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(EXPERIMENT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors (private mode, etc.)
      }
      return next;
    });
  }, []);

  const resetConfig = useCallback(() => {
    setConfigState(defaultExperimentConfig);
    try {
      localStorage.removeItem(EXPERIMENT_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({
      config,
      setConfig,
      resetConfig,
      panelOpen,
      openPanel: () => setPanelOpen(true),
      closePanel: () => setPanelOpen(false),
    }),
    [config, setConfig, resetConfig, panelOpen]
  );

  return <ExperimentContext.Provider value={value}>{children}</ExperimentContext.Provider>;
}
