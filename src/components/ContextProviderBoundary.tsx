import { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

import ErrorBoundary from "./ErrorBoundary";
import { Button } from "@/components/ui/button";

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
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
          <div className="w-full max-w-xl space-y-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">
                {contextName} temporarily unavailable
              </h2>
              <p className="text-sm text-muted-foreground">
                {description ??
                  `We couldn't load the ${contextName.toLowerCase()} provider. Please try again.`}
              </p>
            </div>
            {error?.message ? (
              <pre className="max-h-48 overflow-auto rounded-md bg-background/60 p-3 text-left text-xs text-muted-foreground">
                {error.message}
              </pre>
            ) : null}
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="sm" onClick={reset}>
                Try again
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                Reload app
              </Button>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ContextProviderBoundary;
