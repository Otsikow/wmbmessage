import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable hover lift animation */
  hoverable?: boolean;
  /** Show ambient glow behind the card */
  glow?: boolean;
  /** Intensity of the glass effect: "subtle" | "medium" | "strong" */
  intensity?: "subtle" | "medium" | "strong";
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hoverable = true, glow = true, intensity = "medium", children, ...props }, ref) => {
    const intensityStyles = {
      subtle: "bg-white/[0.04] backdrop-blur-[10px] saturate-[120%]",
      medium: "bg-white/[0.06] backdrop-blur-[16px] saturate-[180%]",
      strong: "bg-white/[0.08] backdrop-blur-[20px] saturate-[200%]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base glass styling
          "relative rounded-[20px] border border-white/[0.08]",
          intensityStyles[intensity],
          // Inner glow
          "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]",
          // Gradient highlight
          "bg-gradient-to-br from-white/[0.12] via-white/[0.06] to-white/[0.03]",
          // Card foreground
          "text-card-foreground",
          // Ambient glow
          glow && "drop-shadow-[0_8px_25px_rgba(0,0,0,0.4)]",
          // Hover effects
          hoverable && [
            "transition-all duration-[350ms] ease-out",
            "hover:-translate-y-1 hover:scale-[1.01]",
            "hover:border-white/25",
            "hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18),0_12px_35px_rgba(0,0,0,0.5)]",
          ],
          className
        )}
        {...props}
      >
        {/* Top edge highlight */}
        <div 
          className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[20px] bg-gradient-to-r from-transparent via-white/20 to-transparent" 
          aria-hidden="true"
        />
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";

const GlassCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
GlassCardHeader.displayName = "GlassCardHeader";

const GlassCardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        // Brighter foreground for headings
        "text-white/90",
        className
      )}
      {...props}
    />
  )
);
GlassCardTitle.displayName = "GlassCardTitle";

const GlassCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-sm",
        // Softer body copy
        "text-white/70",
        className
      )}
      {...props}
    />
  )
);
GlassCardDescription.displayName = "GlassCardDescription";

const GlassCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0 text-white/70", className)} {...props} />
  )
);
GlassCardContent.displayName = "GlassCardContent";

const GlassCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
GlassCardFooter.displayName = "GlassCardFooter";

// Neon icon wrapper for glowing icons
const GlassCardIcon = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center",
        // Neon glow effect using filter
        "[&>svg]:drop-shadow-[0_0_4px_currentColor]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
);
GlassCardIcon.displayName = "GlassCardIcon";

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
  GlassCardIcon,
};
