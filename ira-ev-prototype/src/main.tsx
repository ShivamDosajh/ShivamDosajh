import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ExperimentProvider } from "./components/experiments/ExperimentProvider";
import { ZomatoOrderProvider } from "./components/zomato/ZomatoOrderProvider";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ExperimentProvider>
        <ZomatoOrderProvider>
          <App />
        </ZomatoOrderProvider>
      </ExperimentProvider>
    </ErrorBoundary>
  </StrictMode>
);
