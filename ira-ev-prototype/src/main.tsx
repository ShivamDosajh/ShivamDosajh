import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ExperimentProvider } from "./components/experiments/ExperimentProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ExperimentProvider>
      <App />
    </ExperimentProvider>
  </StrictMode>
);
