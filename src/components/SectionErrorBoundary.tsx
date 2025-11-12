import { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

import ErrorBoundary from "./ErrorBoundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <Alert
          variant="destructive"
          className="flex flex-col gap-3 border-dashed bg-destructive/10"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            <div className="space-y-1">
              <AlertTitle className="text-base font-semibold">
                {section} section unavailable
              </AlertTitle>
              <AlertDescription className="space-y-3 text-sm">
                <p>
                  We ran into a problem while rendering this part of the app.
                  Please try again and let us know if the issue persists.
                </p>
                {description ? <p>{description}</p> : null}
                {error?.message ? (
                  <pre className="max-h-32 overflow-auto rounded-md bg-destructive/15 p-3 text-left font-mono text-xs">
                    {error.message}
                  </pre>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={reset}>
                    Try again
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Reload app
                  </Button>
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export default SectionErrorBoundary;
