import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ExperimentProvider } from "./components/experiments/ExperimentProvider";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ExperimentProvider>
        <App />
      </ExperimentProvider>
    </ErrorBoundary>
  </StrictMode>
);
