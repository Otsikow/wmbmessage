import { ReactNode } from "react";
import ErrorBoundary from "./ErrorBoundary";
import { ErrorFallback } from "./ErrorFallback";

interface ContextProviderBoundaryProps {
  /** Human readable name of the provider being guarded. */
  contextName: string;
  /** Additional context displayed under the title. */
  description?: string;
  children: ReactNode;
}

export function ContextProviderBoundary({
  contextName,
  description,
  children,
}: ContextProviderBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={reset}
          title={`${contextName} temporarily unavailable`}
          description={
            description ??
            `We couldn't load the ${contextName.toLowerCase()} provider. Please try again.`
          }
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ContextProviderBoundary;
