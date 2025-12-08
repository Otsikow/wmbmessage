import { useRef, useCallback, useEffect } from "react";

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number;
  maxSwipeTime?: number;
}

interface SwipeState {
  startX: number;
  startY: number;
  startTime: number;
}

/**
 * Custom hook to detect horizontal swipe gestures on touch devices.
 * Returns a ref that should be attached to the swipeable element.
 */
export function useSwipe<T extends HTMLElement = HTMLElement>({
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistance = 50,
  maxSwipeTime = 500,
}: SwipeConfig) {
  const elementRef = useRef<T>(null);
  const swipeState = useRef<SwipeState | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    swipeState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!swipeState.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - swipeState.current.startX;
      const deltaY = touch.clientY - swipeState.current.startY;
      const deltaTime = Date.now() - swipeState.current.startTime;

      // Reset state
      swipeState.current = null;

      // Check if swipe was quick enough
      if (deltaTime > maxSwipeTime) return;

      // Check if horizontal swipe (deltaX should be larger than deltaY)
      if (Math.abs(deltaX) < Math.abs(deltaY)) return;

      // Check if swipe distance is sufficient
      if (Math.abs(deltaX) < minSwipeDistance) return;

      // Determine direction and call appropriate callback
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    },
    [onSwipeLeft, onSwipeRight, minSwipeDistance, maxSwipeTime]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return elementRef;
}
