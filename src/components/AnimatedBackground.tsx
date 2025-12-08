import * as React from "react";
import "./AnimatedBackground.css";

interface ParallaxState {
  x: number;
  y: number;
}

/**
 * AnimatedBackground - A premium Aura-style animated background
 * Features:
 * - Soft gradient blobs with parallax motion
 * - Floating particle dots
 * - Mouse hover parallax effect
 * - Scroll-based parallax
 * - GPU-accelerated transforms
 * - Mobile optimized (CSS-only animations)
 */
function AnimatedBackgroundComponent() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const parallaxRef = React.useRef<ParallaxState>({ x: 0, y: 0 });
  const rafRef = React.useRef<number | null>(null);
  const isMobileRef = React.useRef(false);

  // Check if mobile on mount
  React.useEffect(() => {
    isMobileRef.current = window.matchMedia("(max-width: 768px)").matches;
  }, []);

  // Smooth parallax update using RAF
  const updateParallax = React.useCallback(() => {
    if (!containerRef.current || isMobileRef.current) return;

    const { x, y } = parallaxRef.current;

    // Apply parallax to blob layers with different intensities
    const blobLayers = containerRef.current.querySelectorAll<HTMLElement>("[data-parallax-layer]");
    blobLayers.forEach((layer) => {
      const intensity = parseFloat(layer.dataset.parallaxIntensity || "1");
      const translateX = x * intensity;
      const translateY = y * intensity;
      layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    });

    rafRef.current = null;
  }, []);

  // Mouse move handler with throttling via RAF
  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (isMobileRef.current) return;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Calculate offset from center (-1 to 1 range)
      const offsetX = (e.clientX - centerX) / centerX;
      const offsetY = (e.clientY - centerY) / centerY;

      // Store parallax values (max 6px movement)
      parallaxRef.current = {
        x: offsetX * 6,
        y: offsetY * 6,
      };

      // Throttle updates using RAF
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updateParallax);
      }
    },
    [updateParallax]
  );

  // Scroll parallax handler
  const handleScroll = React.useCallback(() => {
    if (!containerRef.current || isMobileRef.current) return;

    const scrollY = window.scrollY;
    const scrollLayers = containerRef.current.querySelectorAll<HTMLElement>("[data-scroll-layer]");

    scrollLayers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.scrollSpeed || "0.1");
      const translateY = scrollY * speed;
      const currentTransform = layer.style.transform || "";
      // Preserve mouse parallax and add scroll parallax
      const baseTransform = currentTransform.replace(/translateY\([^)]+\)/, "");
      layer.style.transform = `${baseTransform} translateY(${-translateY}px)`.trim();
    });
  }, []);

  // Set up event listeners
  React.useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMouseMove, handleScroll]);

  return (
    <div
      ref={containerRef}
      className="animated-bg pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      {/* Layer 1: Large primary blob (blue) - slowest */}
      <div
        className="animated-bg__blob animated-bg__blob--primary"
        data-parallax-layer
        data-parallax-intensity="0.3"
        data-scroll-layer
        data-scroll-speed="0.05"
      />

      {/* Layer 2: Secondary blob (purple) */}
      <div
        className="animated-bg__blob animated-bg__blob--secondary"
        data-parallax-layer
        data-parallax-intensity="0.5"
        data-scroll-layer
        data-scroll-speed="0.08"
      />

      {/* Layer 3: Accent blob (teal) */}
      <div
        className="animated-bg__blob animated-bg__blob--accent"
        data-parallax-layer
        data-parallax-intensity="0.7"
        data-scroll-layer
        data-scroll-speed="0.1"
      />

      {/* Layer 4: Smaller floating blob */}
      <div
        className="animated-bg__blob animated-bg__blob--small"
        data-parallax-layer
        data-parallax-intensity="0.9"
        data-scroll-layer
        data-scroll-speed="0.12"
      />

      {/* Particle container */}
      <div className="animated-bg__particles">
        {/* Static particles rendered via CSS for performance */}
        <div className="animated-bg__particle animated-bg__particle--1" />
        <div className="animated-bg__particle animated-bg__particle--2" />
        <div className="animated-bg__particle animated-bg__particle--3" />
        <div className="animated-bg__particle animated-bg__particle--4" />
        <div className="animated-bg__particle animated-bg__particle--5" />
        <div className="animated-bg__particle animated-bg__particle--6" />
        <div className="animated-bg__particle animated-bg__particle--7" />
        <div className="animated-bg__particle animated-bg__particle--8" />
        <div className="animated-bg__particle animated-bg__particle--9" />
        <div className="animated-bg__particle animated-bg__particle--10" />
        <div className="animated-bg__particle animated-bg__particle--11" />
        <div className="animated-bg__particle animated-bg__particle--12" />
      </div>
    </div>
  );
}

// Memoize the component for performance
const AnimatedBackground = React.memo(AnimatedBackgroundComponent);

export default AnimatedBackground;
