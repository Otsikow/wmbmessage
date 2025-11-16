import { useCallback, useState } from "react";

import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

/**
 * Handles global error recovery by remounting the application when the
 * top-level error boundary is reset.
 */
export function AppRoot() {
  const [appInstanceKey, setAppInstanceKey] = useState(0);

  const handleRetry = useCallback(() => {
    setAppInstanceKey((previous) => previous + 1);
  }, []);

  return (
    <ErrorBoundary onReset={handleRetry}>
      <App key={appInstanceKey} />
    </ErrorBoundary>
  );
}

export default AppRoot;
