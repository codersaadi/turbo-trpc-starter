"use client";

import * as React from "react";
import { cn } from "@repo/ui/lib/utils";

export interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "minimal" | "floating" | "glow";
  label?: string;
}

const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
  (
    { className, type, variant = "default", label, placeholder, ...props },
    ref,
  ) => {
    if (variant === "floating") {
      return (
        <div className="relative group">
          <input
            type={type}
            className={cn(
              "peer flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-transparent focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            ref={ref}
            placeholder={placeholder || " "} // Required for :placeholder-shown
            {...props}
          />
          <label
            className={cn(
              "absolute left-3 top-2.5 z-10 origin-left -translate-y-5 scale-75 transform px-1 bg-background text-sm text-muted-foreground duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-5 peer-focus:scale-75 peer-focus:text-primary pointer-events-none",
            )}
          >
            {label || placeholder}
          </label>
        </div>
      );
    }

    if (variant === "minimal") {
      return (
        <div className="relative group">
          <input
            type={type}
            className={cn(
              "flex h-10 w-full border-b border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
              className,
            )}
            ref={ref}
            placeholder={placeholder}
            {...props}
          />
        </div>
      );
    }

    if (variant === "glow") {
      return (
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow duration-300 focus:shadow-[0_0_20px_rgba(var(--primary),0.3)] dark:focus:shadow-[0_0_20px_rgba(255,255,255,0.1)]",
            className,
          )}
          ref={ref}
          placeholder={placeholder}
          {...props}
        />
      );
    }

    // Default
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        placeholder={placeholder}
        {...props}
      />
    );
  },
);
PremiumInput.displayName = "PremiumInput";

export { PremiumInput };
