import * as React from "react";
import { cn } from "@repo/ui/lib/utils";

interface StatePlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "error" | "compact";
}

export function StatePlaceholder({
  className,
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  ...props
}: StatePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50",
        variant === "default" && "bg-muted/10",
        variant === "error" && "bg-red-500/5 border-red-500/20",
        variant === "compact" && "p-4 border-none bg-transparent",
        className,
      )}
      {...props}
    >
      {Icon && (
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4",
            variant === "error" && "bg-red-500/10 text-red-500",
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
