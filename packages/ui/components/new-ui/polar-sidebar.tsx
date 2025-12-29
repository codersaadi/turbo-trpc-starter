"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { cn } from "@repo/ui/lib/utils";
import { Input } from "@repo/ui/components/ui/input";

// --- Polar Sidebar Context ---
interface PolarSidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const PolarSidebarContext = React.createContext<PolarSidebarContextType>({
  isOpen: true,
  setIsOpen: () => {},
});

// --- Polar Sidebar Root ---
interface PolarSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
}

export function PolarSidebar({
  className,
  children,
  defaultOpen = true,
  ...props
}: PolarSidebarProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <PolarSidebarContext.Provider value={{ isOpen, setIsOpen }}>
      <div
        className={cn(
          "flex h-full w-70 flex-col bg-background text-foreground border-r border-border/40 transition-all duration-300",
          !isOpen && "w-15", // Collapsed width
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </PolarSidebarContext.Provider>
  );
}

// --- Polar Sidebar Header (Brand + Search) ---
export function PolarSidebarHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-4 py-4 space-y-4", className)} {...props}>
      {children}
    </div>
  );
}

// --- Polar Search Input ---
export function PolarSearchInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative group">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
      <Input
        type="search"
        placeholder="Search..."
        className={cn(
          "pl-9 pr-12 h-9 bg-muted/40 border-transparent focus:border-border focus:bg-background transition-all",
          className,
        )}
        {...props}
      />
      <kbd className="pointer-events-none absolute right-2.5 top-2.5 inline-flex h-4 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
    </div>
  );
}

// --- Polar Sidebar Content (Scrollable Area) ---
export function PolarSidebarContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-auto py-2 px-2", className)} {...props}>
      {children}
    </div>
  );
}

// --- Polar Sidebar Footer ---
export function PolarSidebarFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-auto p-4 border-t border-border/40", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// --- Polar Sidebar Group ---
interface PolarSidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export function PolarSidebarGroup({
  label,
  className,
  children,
  ...props
}: PolarSidebarGroupProps) {
  return (
    <div className={cn("mb-6", className)} {...props}>
      {label && (
        <h4 className="mb-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </h4>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

// --- Polar Sidebar Item ---
interface PolarSidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ElementType;
  active?: boolean;
  notifications?: number;
}

export const PolarSidebarItem = React.forwardRef<
  HTMLButtonElement,
  PolarSidebarItemProps
>(
  (
    { className, icon: Icon, active, children, notifications, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent/50 hover:text-accent-foreground",
          active
            ? "bg-accent/80 text-accent-foreground"
            : "text-muted-foreground",
          className,
        )}
        {...props}
      >
        {Icon && (
          <Icon
            className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground group-hover:text-foreground",
            )}
          />
        )}
        <span className="flex-1 text-left truncate">{children}</span>
        {notifications !== undefined && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
            {notifications}
          </span>
        )}
      </button>
    );
  },
);
PolarSidebarItem.displayName = "PolarSidebarItem";

// --- Polar Sidebar SubItem (Tree Structure) ---
interface PolarSidebarSubItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const PolarSidebarSubItem = React.forwardRef<
  HTMLButtonElement,
  PolarSidebarSubItemProps
>(({ className, active, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-md pl-9 pr-2 py-1.5 text-sm transition-colors hover:text-foreground",
        active ? "text-foreground font-medium" : "text-muted-foreground",
        className,
      )}
      {...props}
    >
      {/* Tree Line Connector */}
      <div className="absolute left-[1.15rem] top-0 h-full w-px bg-border/40 group-last:h-1/2" />
      <div
        className={cn(
          "absolute left-[1.15rem] top-1/2 w-2.5 h-px bg-border/40",
          active && "bg-foreground/40",
        )}
      />

      <span className="truncate">{children}</span>
    </button>
  );
});
PolarSidebarSubItem.displayName = "PolarSidebarSubItem";
