import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface RouteTransitionIndicatorProps {
  /**
   * Minimum number of milliseconds to keep the indicator visible.
   * A small delay helps smooth out quick transitions.
   */
  minDuration?: number;
}

export function RouteTransitionIndicator({
  minDuration = 500,
}: RouteTransitionIndicatorProps) {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const firstLoadRef = useRef(true);

  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }

    setIsTransitioning(true);
    const timeout = window.setTimeout(() => {
      setIsTransitioning(false);
    }, minDuration);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [location, minDuration]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300",
        isTransitioning
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
    >
      <div className="flex flex-col items-center gap-3 rounded-xl bg-background/60 px-6 py-4 text-center shadow-lg shadow-black/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          Loading new page…
        </span>
      </div>
    </div>
  );
}
