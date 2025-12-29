"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@repo/ui/lib/utils";

const ModernDrawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);
ModernDrawer.displayName = "ModernDrawer";

const ModernDrawerTrigger = DrawerPrimitive.Trigger;

const ModernDrawerPortal = DrawerPrimitive.Portal;

const ModernDrawerClose = DrawerPrimitive.Close;

const ModernDrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/40 backdrop-blur-sm", className)}
    {...props}
  />
));
ModernDrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const ModernDrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ModernDrawerPortal>
    <ModernDrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[26px] border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-1.5 w-15 rounded-full bg-muted-foreground/30" />
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </DrawerPrimitive.Content>
  </ModernDrawerPortal>
));
ModernDrawerContent.displayName = "ModernDrawerContent";

const ModernDrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
);
ModernDrawerHeader.displayName = "ModernDrawerHeader";

const ModernDrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);
ModernDrawerFooter.displayName = "ModernDrawerFooter";

const ModernDrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
ModernDrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const ModernDrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ModernDrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  ModernDrawer,
  ModernDrawerPortal,
  ModernDrawerOverlay,
  ModernDrawerTrigger,
  ModernDrawerClose,
  ModernDrawerContent,
  ModernDrawerHeader,
  ModernDrawerFooter,
  ModernDrawerTitle,
  ModernDrawerDescription,
};
