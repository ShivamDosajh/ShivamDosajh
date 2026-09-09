import { Component, Fragment, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  resetKey: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, resetKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("iRA.ev prototype crashed:", error, info.componentStack);
  }

  handleReset = () => {
    try {
      sessionStorage.removeItem("ira-ev-charging-flow");
    } catch {
      // ignore
    }
    this.setState((prev) => ({ error: null, resetKey: prev.resetKey + 1 }));
  };

  render() {
    if (this.state.error) {
      return (
        <div className="h-dvh w-full flex flex-col items-center justify-center gap-5 bg-background text-text px-8 text-center safe-top safe-bottom">
          <div className="w-16 h-16 rounded-full bg-error/15 flex items-center justify-center">
            <AlertTriangle size={28} className="text-error" />
          </div>
          <div>
            <p className="text-[16px] font-medium">Something went wrong</p>
            <p className="text-[13px] text-secondaryText mt-1.5 leading-relaxed">
              The prototype hit an unexpected error. Tap below to reset it back to the station map — no need
              to relaunch the app.
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="h-12 px-6 rounded-button bg-primary text-black font-semibold text-[15px] min-h-[44px]"
          >
            Reset prototype
          </button>
        </div>
      );
    }

    return <Fragment key={this.state.resetKey}>{this.props.children}</Fragment>;
  }
}
