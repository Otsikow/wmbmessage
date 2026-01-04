import { AlertTriangle, Home, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  title?: string;
  description?: string;
  className?: string;
  /**
   * If true, renders a compact alert instead of a full card.
   * Useful for small sections or widgets.
   */
  minimal?: boolean;
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  className,
  minimal = false,
}: ErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  if (minimal) {
    return (
      <Alert
        variant="destructive"
        className={cn(
          "flex flex-col gap-3 border-dashed bg-destructive/5",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5" />
          <div className="flex-1 space-y-1">
            <AlertTitle className="text-base font-semibold">{title}</AlertTitle>
            <AlertDescription className="space-y-3 text-sm">
              <p>{description}</p>
              {error?.message && (
                <div className="rounded-md bg-destructive/10 p-2 font-mono text-xs">
                  {error.message}
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                {resetErrorBoundary && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-destructive/20 bg-background hover:bg-destructive/10 hover:text-destructive"
                    onClick={resetErrorBoundary}
                  >
                    <RotateCw className="mr-2 h-3.5 w-3.5" />
                    Try again
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleReload}
                >
                  Reload
                </Button>
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-[50vh] flex-col items-center justify-center p-4 md:p-6",
        className
      )}
    >
      <Card className="w-full max-w-lg border-destructive/20 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl md:text-2xl">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="relative rounded-lg border border-destructive/10 bg-muted/50 p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Error Details
              </div>
              <ScrollArea className="h-[100px] w-full rounded-md">
                <code className="block text-sm text-destructive">
                  {error.message || "Unknown error occurred"}
                </code>
                {error.stack && (
                  <pre className="mt-2 text-xs text-muted-foreground/80">
                    {error.stack.split("\n")[0]} {/* Only show first line of stack for cleanliness */}
                  </pre>
                )}
              </ScrollArea>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          {resetErrorBoundary && (
            <Button onClick={resetErrorBoundary} className="w-full sm:w-auto">
              <RotateCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleReload}
            className="w-full sm:w-auto"
          >
            Reload application
          </Button>

          <Button
            variant="ghost"
            onClick={handleGoHome}
            className="w-full sm:w-auto"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
