import * as React from "react";
import { cn } from "@repo/ui/lib/utils";

interface BetterCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient";
  hoverEffect?: boolean;
  subtleGradient?: boolean;
}

const BetterCard = React.forwardRef<HTMLDivElement, BetterCardProps>(
  (
    {
      className,
      variant = "default",
      hoverEffect = true,
      subtleGradient = false,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300",
          hoverEffect && "hover:shadow-lg hover:-translate-y-1",
          variant === "glass" &&
            "bg-white/10 dark:bg-black/10 backdrop-blur-md border-white/20 dark:border-white/10 shadow-xl",
          variant === "gradient" &&
            "bg-linear-to-br from-card to-accent/20 border-accent/50",
          subtleGradient &&
            variant === "default" &&
            "bg-linear-to-br from-card to-accent/10 dark:to-accent/20",
          className,
        )}
        {...props}
      />
    );
  },
);
BetterCard.displayName = "BetterCard";

const BetterCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
BetterCardHeader.displayName = "BetterCardHeader";

const BetterCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
BetterCardTitle.displayName = "BetterCardTitle";

const BetterCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
BetterCardDescription.displayName = "BetterCardDescription";

const BetterCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
BetterCardContent.displayName = "BetterCardContent";

const BetterCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
BetterCardFooter.displayName = "BetterCardFooter";

export {
  BetterCard,
  BetterCardHeader,
  BetterCardFooter,
  BetterCardTitle,
  BetterCardDescription,
  BetterCardContent,
};
