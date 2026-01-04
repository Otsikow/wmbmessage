import { ReactNode } from "react";
import ErrorBoundary from "./ErrorBoundary";
import { ErrorFallback } from "./ErrorFallback";

interface SectionErrorBoundaryProps {
  /** Human readable name of the section being wrapped. */
  section: string;
  /** Optional additional context displayed under the title. */
  description?: string;
  children: ReactNode;
}

export function SectionErrorBoundary({
  section,
  description,
  children,
}: SectionErrorBoundaryProps) {
  // Use minimal style for specific sections that are likely small
  const isSmallSection =
    section === "Engagement prompt" ||
    section === "Engagement summary" ||
    section === "Daily verse" ||
    section === "Reading plan";

  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={reset}
          title={`${section} unavailable`}
          description={
            description ??
            "We ran into a problem while rendering this part of the app."
          }
          minimal={isSmallSection}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export default SectionErrorBoundary;
