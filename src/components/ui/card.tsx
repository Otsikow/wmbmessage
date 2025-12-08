import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card Variants:
 * - default: standard shadcn style card
 * - glass: premium MessageGuide glass morphism card
 * - elevated: lifted glass variant
 * - neon: strong neon glow effect
 *
 * hoverable: whether the card lifts/glows on hover (glass variants only)
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "neon";
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hoverable = false, ...props }, ref) => {
    const isGlass = variant === "glass" || variant === "elevated" || variant === "neon";

    return (
      <div
        ref={ref}
        className={cn(
          // Base card styling
          "rounded-[20px] text-card-foreground transition-all duration-300",

          // ==========================
          // VARIANTS
          // ==========================
          variant === "default" && "border bg-card shadow-sm",

          variant === "glass" &&
            "glass-card rounded-[20px] border-white/10 bg-white/[0.06] backdrop-blur-[16px]",

          variant === "elevated" &&
            "glass-elevated rounded-[20px] border-white/15 bg-white/[0.08] backdrop-blur-[18px] shadow-glass-elevated",

          variant === "neon" &&
            "glass glass-neon-primary rounded-[20px] border-primary/30 shadow-neon",

          // ==========================
          // HOVER EFFECTS
          // ==========================
          hoverable &&
            isGlass &&
            "glass-card-hoverable hover:shadow-glass-hover dark:hover:shadow-glass-hover-dark hover:-translate-y-[2px]",

          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

// ========================================================
// Subcomponents
// ========================================================

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  glass?: boolean;
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, glass, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        glass && "glass-heading",
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  glass?: boolean;
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, glass, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm", glass ? "glass-body" : "text-muted-foreground", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, glass, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", glass && "glass-body", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

/**
 * CardIcon:
 * Neon-friendly icon wrapper for glass/elevated/neon cards.
 */
const CardIcon = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => (
    <span ref={ref} className={cn("inline-flex items-center justify-center glass-icon", className)} {...props}>
      {children}
    </span>
  )
);
CardIcon.displayName = "CardIcon";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardIcon };
