import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps {
  className?: string;
  /** Enable cursor-reactive depth effect */
  cursorReactive?: boolean;
  /** Show floating particles/dots */
  showParticles?: boolean;
  /** Number of gradient blobs */
  blobCount?: number;
  /** Intensity of the parallax effect (0-1) */
  parallaxIntensity?: number;
}

/**
 * Premium animated background with gradient blobs, floating particles,
 * and optional cursor-reactive parallax effects.
 * All animations are GPU-accelerated using translate3d.
 */
export function AnimatedBackground({
  className,
  cursorReactive = true,
  showParticles = true,
  blobCount = 3,
  parallaxIntensity = 0.5,
}: AnimatedBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const mousePos = useRef({ x: 0.5, y: 0.5 });

  // Handle cursor movement for parallax effect
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!cursorReactive || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      mousePos.current = { x, y };
    },
    [cursorReactive]
  );

  // Animate parallax effect with RAF for smooth 60fps
  const animate = useCallback(() => {
    if (!cursorReactive) return;

    const { x, y } = mousePos.current;
    const offsetX = (x - 0.5) * 40 * parallaxIntensity;
    const offsetY = (y - 0.5) * 40 * parallaxIntensity;

    if (blobsRef.current) {
      blobsRef.current.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
    }

    if (particlesRef.current) {
      particlesRef.current.style.transform = `translate3d(${-offsetX * 0.5}px, ${-offsetY * 0.5}px, 0)`;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [cursorReactive, parallaxIntensity]);

  useEffect(() => {
    if (!cursorReactive) return;

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [cursorReactive, handleMouseMove, animate]);

  // Generate gradient blob positions
  const blobs = Array.from({ length: blobCount }, (_, i) => ({
    id: i,
    size: 300 + Math.random() * 400,
    x: 10 + (i * 30) + Math.random() * 20,
    y: 10 + Math.random() * 60,
    delay: i * 2,
    duration: 15 + Math.random() * 10,
    hue1: 220 + (i * 20), // Blue-purple spectrum
    hue2: 260 + (i * 15),
  }));

  // Generate particle positions
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 20,
    opacity: 0.2 + Math.random() * 0.4,
  }));

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
      aria-hidden="true"
    >
      {/* Gradient Blobs Layer */}
      <div
        ref={blobsRef}
        className="absolute inset-0 will-change-transform"
        style={{ transition: "transform 0.1s ease-out" }}
      >
        {blobs.map((blob) => (
          <div
            key={blob.id}
            className="absolute rounded-full blur-3xl animate-blob"
            style={{
              width: blob.size,
              height: blob.size,
              left: `${blob.x}%`,
              top: `${blob.y}%`,
              background: `linear-gradient(135deg, 
                hsla(${blob.hue1}, 80%, 60%, 0.2) 0%, 
                hsla(${blob.hue2}, 70%, 50%, 0.15) 50%,
                hsla(${blob.hue1 + 30}, 60%, 40%, 0.1) 100%)`,
              animationDelay: `${blob.delay}s`,
              animationDuration: `${blob.duration}s`,
              transform: "translate3d(0, 0, 0)",
            }}
          />
        ))}
      </div>

      {/* Floating Particles Layer */}
      {showParticles && (
        <div
          ref={particlesRef}
          className="absolute inset-0 will-change-transform"
          style={{ transition: "transform 0.15s ease-out" }}
        >
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full animate-float"
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                backgroundColor: `hsla(220, 70%, 70%, ${particle.opacity})`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                boxShadow: `0 0 ${particle.size * 2}px hsla(220, 70%, 70%, ${particle.opacity * 0.5})`,
                transform: "translate3d(0, 0, 0)",
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle Mesh Gradient Overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, hsla(240, 70%, 50%, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, hsla(280, 60%, 50%, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 50% 90%, hsla(200, 80%, 50%, 0.1) 0%, transparent 40%)
          `,
        }}
      />
    </div>
  );
}

export default AnimatedBackground;
