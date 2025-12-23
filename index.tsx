import React, { Suspense, ReactNode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./services/i18n"
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { HelmetProvider } from "react-helmet-async";
import React from "react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
      <Analytics />
      <SpeedInsights />
    </HelmetProvider>
  </React.StrictMode>
);

// --- STORAGE SAFETY CHECK (Mobile Crash Prevention) ---
const validateStorage = () => {
  try {
    // 1) Total Size Check
    let total = 0;
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += (localStorage[x].length + x.length) * 2;
      }
    }
    if (total > 4_500_000) {
      console.warn(
        `[Critical] Storage full (${(total / 1024 / 1024).toFixed(
          2
        )}MB). Cleaning heavy data.`
      );
      localStorage.removeItem("scubaSteveAllBriefings");
    }

    // 2) Integrity Check
    const keys = ["scubaSteveCurrentUser", "scubaSteveAllBriefings"];
    for (const key of keys) {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          JSON.parse(item);
        } catch (e) {
          console.warn(
            `[Critical] Corrupted data found in ${key}. Clearing to prevent crash.`
          );
          localStorage.removeItem(key);
        }
      }
    }
  } catch (e) {
    console.error("Storage access failed entirely. Clearing all to recover.", e);
    try {
      localStorage.clear();
    } catch (err) {
      // Ignore
    }
  }
};

validateStorage();

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Crash:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      console.log("Local storage cleared for reset.");
    } catch (e) {
      console.error("Could not clear storage", e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-red-50 text-red-900 h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <p className="mb-4">
            The app crashed. This often happens on mobile if the dive log memory is full.
          </p>
          <pre className="text-xs bg-white p-4 rounded border border-red-200 max-w-full overflow-auto text-left mb-4">
            {this.state.error?.toString()}
          </pre>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold shadow-lg hover:bg-red-700"
            >
              Reload App
            </button>
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-white text-red-600 border border-red-600 rounded-lg font-bold hover:bg-red-50"
            >
              Reset Data (Fix Crash)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children as any;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log("Mounting Scuba Steve App...");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text text-xl font-bold animate-pulse">
              Loading Scuba Steve...
            </div>
          }
        >
          <App />
        </Suspense>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);
