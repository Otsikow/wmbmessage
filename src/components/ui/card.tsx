import * as React from "react";

import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Apply glass morphism styling */
  variant?: "default" | "glass";
  /** Enable hover lift animation (glass variant only) */
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hoverable = true, ...props }, ref) => {
    const isGlass = variant === "glass";
    
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "rounded-[20px] text-card-foreground",
          // Default variant
          !isGlass && "border bg-card shadow-sm",
          // Glass variant
          isGlass && [
            "glass-card",
            hoverable && "glass-card-hoverable",
          ],
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Apply glass text styling (brighter foreground) */
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
  ),
);
CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Apply glass text styling (softer foreground) */
  glass?: boolean;
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, glass, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-sm",
        glass ? "glass-body" : "text-muted-foreground",
        className
      )}
      {...props}
    />
  ),
);
CardDescription.displayName = "CardDescription";

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Apply glass text styling */
  glass?: boolean;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, glass, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6 pt-0", glass && "glass-body", className)}
      {...props}
    />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

/** Icon wrapper that applies neon glow effect for glass cards */
const CardIcon = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("inline-flex items-center justify-center glass-icon", className)}
      {...props}
    >
      {children}
    </span>
  ),
);
CardIcon.displayName = "CardIcon";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardIcon };
