import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ============================================================
   GLASS CARD VARIANTS (Unified + Enhanced)
   ============================================================ */

const glassCardVariants = cva(
  "relative overflow-hidden rounded-[20px] transition-all duration-300 ease-out will-change-transform text-card-foreground",
  {
    variants: {
      variant: {
        default: [
          "bg-card/40 dark:bg-card/30",
          "backdrop-blur-xl backdrop-saturate-150",
          "border border-white/20 dark:border-white/10",
          "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
          "shadow-glass",
        ],
        elevated: [
          "bg-card/50 dark:bg-card/40",
          "backdrop-blur-2xl backdrop-saturate-150",
          "border border-white/30 dark:border-white/15",
          "shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)]",
          "shadow-glass-elevated",
        ],
        subtle: [
          "bg-card/20 dark:bg-card/15",
          "backdrop-blur-lg backdrop-saturate-125",
          "border border-white/10 dark:border-white/5",
          "shadow-[inset_0_0.5px_1px_rgba(255,255,255,0.08)]",
          "shadow-glass-subtle",
        ],
        neon: [
          "bg-card/30 dark:bg-card/25",
          "backdrop-blur-xl backdrop-saturate-150",
          "border border-primary/30 dark:border-primary/40",
          "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
          "shadow-neon",
        ],
      },
      hover: {
        true: [
          "hover:scale-[1.02] hover:-translate-y-1",
          "hover:shadow-glass-hover dark:hover:shadow-glass-hover-dark",
          "hover:border-white/30 dark:hover:border-white/20",
          "hover:bg-card/50 dark:hover:bg-card/40",
        ],
        false: [],
      },
      glow: {
        true: "animate-glow-pulse",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: false,
      glow: false,
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  neonColor?: "primary" | "secondary" | "accent";
}

/* ============================================================
   MAIN CARD
   ============================================================ */

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, hover, glow, neonColor, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          glassCardVariants({ variant, hover, glow }),
          neonColor && `glass-neon-${neonColor}`,
          className
        )}
        {...props}
      >
        {/* Subtle inner gloss */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[20px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, transparent 100%)",
          }}
        />

        {/* Top highlight line */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[20px] bg-gradient-to-r from-transparent via-white/25 to-transparent"
          aria-hidden="true"
        />

        {/* Content wrapper */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

/* ============================================================
   SUBCOMPONENTS
   ============================================================ */

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
      className={cn("text-2xl font-semibold leading-none tracking-tight text-white/90", className)}
      {...props}
    />
  )
);
GlassCardTitle.displayName = "GlassCardTitle";

const GlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-white/70", className)} {...props} />
));
GlassCardDescription.displayName = "GlassCardDescription";

const GlassCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0 text-white/80", className)} {...props} />
  )
);
GlassCardContent.displayName = "GlassCardContent";

const GlassCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
GlassCardFooter.displayName = "GlassCardFooter";

/* ============================================================
   ICON WRAPPER (NEON)
   ============================================================ */

const GlassCardIcon = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center",
        "[&>svg]:drop-shadow-[0_0_5px_currentColor]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
);
GlassCardIcon.displayName = "GlassCardIcon";

/* ============================================================
   EXPORTS
   ============================================================ */

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
  GlassCardIcon,
  glassCardVariants,
};
