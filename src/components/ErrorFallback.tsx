import * as React from "react";
import { AlertTriangle, Home, RotateCw, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  const [isCopied, setIsCopied] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleCopyError = () => {
    if (!error) return;
    const errorText = `${error.message}\n\n${error.stack || "No stack trace available"}`;
    navigator.clipboard.writeText(errorText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <AlertTitle className="text-base font-semibold">{title}</AlertTitle>
            <AlertDescription className="space-y-3 text-sm">
              <p>{description}</p>
              {error?.message && (
                <div className="flex items-center justify-between gap-2 rounded-md bg-destructive/10 p-2 font-mono text-xs">
                   <span className="truncate">{error.message}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 flex-shrink-0 hover:bg-destructive/20 hover:text-destructive"
                      onClick={handleCopyError}
                      title="Copy error details"
                    >
                      {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
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
      <Card className="w-full max-w-lg border-destructive/20 shadow-lg animate-in fade-in zoom-in-95 duration-300">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">{title}</CardTitle>
          <CardDescription className="text-base mt-2 max-w-[90%] mx-auto leading-relaxed">{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {error && (
            <Collapsible
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                className="w-full space-y-2"
            >
             <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent hover:text-primary">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                           {isDetailsOpen ? 'Hide Technical Details' : 'Show Technical Details'}
                           {isDetailsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </span>
                    </Button>
                </CollapsibleTrigger>
                {isDetailsOpen && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        onClick={handleCopyError}
                    >
                        {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {isCopied ? "Copied" : "Copy Error"}
                    </Button>
                )}
             </div>

             <CollapsibleContent className="space-y-2">
                <div className="relative rounded-lg border border-destructive/10 bg-muted/30 p-4 shadow-sm">
                  <ScrollArea className="h-[200px] w-full rounded-md pr-3">
                    <code className="block text-sm font-semibold text-destructive break-words">
                      {error.message || "Unknown error occurred"}
                    </code>
                    {error.stack && (
                      <pre className="mt-4 text-xs text-muted-foreground/80 font-mono whitespace-pre-wrap leading-relaxed">
                        {error.stack}
                      </pre>
                    )}
                  </ScrollArea>
                </div>
             </CollapsibleContent>
             {!isDetailsOpen && (
                 <div className="rounded-lg border border-destructive/10 bg-muted/30 p-3 text-sm text-destructive font-medium flex items-center justify-between">
                     <span className="truncate">{error.message}</span>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={handleCopyError}
                    >
                        {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                 </div>
             )}
            </Collapsible>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center pb-8">
          {resetErrorBoundary && (
            <Button onClick={resetErrorBoundary} className="w-full sm:w-auto min-w-[120px] shadow-sm">
              <RotateCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleReload}
            className="w-full sm:w-auto min-w-[120px]"
          >
            Reload application
          </Button>

          <Button
            variant="ghost"
            onClick={handleGoHome}
            className="w-full sm:w-auto min-w-[120px]"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
