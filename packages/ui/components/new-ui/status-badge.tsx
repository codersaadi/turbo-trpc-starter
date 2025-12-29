import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@repo/ui/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        neutral:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        success:
          "border-transparent bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25",
        warning:
          "border-transparent bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/25",
        error:
          "border-transparent bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-500/25",
        info: "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400 hover:bg-blue-500/25",
      },
      styleType: {
        solid: "",
        soft: "", // Default base style handles this
        dot: "pl-2", // Extra padding for the dot
      },
    },
    defaultVariants: {
      variant: "neutral",
      styleType: "soft",
    },
  },
);

export interface StatusBadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {}

function StatusBadge({
  className,
  variant,
  styleType,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <div
      className={cn(statusBadgeVariants({ variant, styleType }), className)}
      {...props}
    >
      {styleType === "dot" && (
        <span
          className={cn(
            "mr-1.5 h-2 w-2 rounded-full",
            variant === "neutral" && "bg-secondary-foreground",
            variant === "success" && "bg-green-500",
            variant === "warning" && "bg-yellow-500",
            variant === "error" && "bg-red-500",
            variant === "info" && "bg-blue-500",
          )}
        />
      )}
      {children}
    </div>
  );
}

export { StatusBadge, statusBadgeVariants };
