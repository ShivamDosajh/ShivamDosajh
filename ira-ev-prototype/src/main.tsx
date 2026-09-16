import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ExperimentProvider } from "./components/experiments/ExperimentProvider";
import { ZomatoOrderProvider } from "./components/zomato/ZomatoOrderProvider";
import { WalletProvider } from "./components/wallet/WalletProvider";
import { OneClickChargingProvider } from "./components/oneclick/OneClickChargingProvider";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ExperimentProvider>
        <ZomatoOrderProvider>
          <WalletProvider>
            <OneClickChargingProvider>
              <App />
            </OneClickChargingProvider>
          </WalletProvider>
        </ZomatoOrderProvider>
      </ExperimentProvider>
    </ErrorBoundary>
  </StrictMode>
);
