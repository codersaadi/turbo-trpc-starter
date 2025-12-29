"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@repo/ui/lib/utils";

const AnimatedTabs = TabsPrimitive.Root;

const AnimatedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground overflow-hidden relative",
      className,
    )}
    {...props}
  />
));
AnimatedTabsList.displayName = TabsPrimitive.List.displayName;

const AnimatedTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: "default" | "underline";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 z-10",
      variant === "default" &&
        "rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      variant === "underline" &&
        "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary hover:text-foreground",
      className,
    )}
    {...props}
  />
));
AnimatedTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const AnimatedTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in-50 zoom-in-95 duration-200",
      className,
    )}
    {...props}
  />
));
AnimatedTabsContent.displayName = TabsPrimitive.Content.displayName;

export {
  AnimatedTabs,
  AnimatedTabsList,
  AnimatedTabsTrigger,
  AnimatedTabsContent,
};
