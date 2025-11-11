import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import ErrorBoundary from "./ErrorBoundary";

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Wraps route content with an error boundary that automatically resets when
 * the route changes, ensuring navigation away from a failing screen recovers
 * the application UI.
 */
export function RouteErrorBoundary({ children }: RouteErrorBoundaryProps) {
  const location = useLocation();

  return (
    <ErrorBoundary key={location.pathname}>
      {children}
    </ErrorBoundary>
  );
}

export default RouteErrorBoundary;
