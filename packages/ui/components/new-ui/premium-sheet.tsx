"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@repo/ui/lib/utils";

const PremiumSheet = SheetPrimitive.Root;

const PremiumSheetTrigger = SheetPrimitive.Trigger;

const PremiumSheetClose = SheetPrimitive.Close;

const PremiumSheetPortal = SheetPrimitive.Portal;

const PremiumSheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
PremiumSheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
      visual: {
        default: "bg-background",
        gradient:
          "bg-linear-to-br from-background to-muted/50 border-border/50",
        glass:
          "bg-background/80 backdrop-blur-xl border-border/50 supports-[backdrop-filter]:bg-background/60",
      },
    },
    defaultVariants: {
      side: "right",
      visual: "default",
    },
  },
);

interface PremiumSheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const PremiumSheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  PremiumSheetContentProps
>(
  (
    { side = "right", visual = "default", className, children, ...props },
    ref,
  ) => (
    <PremiumSheetPortal>
      <PremiumSheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side, visual }), className)}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </PremiumSheetPortal>
  ),
);
PremiumSheetContent.displayName = SheetPrimitive.Content.displayName;

const PremiumSheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
PremiumSheetHeader.displayName = "PremiumSheetHeader";

const PremiumSheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
PremiumSheetFooter.displayName = "PremiumSheetFooter";

const PremiumSheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
PremiumSheetTitle.displayName = SheetPrimitive.Title.displayName;

const PremiumSheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
PremiumSheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  PremiumSheet,
  PremiumSheetPortal,
  PremiumSheetOverlay,
  PremiumSheetTrigger,
  PremiumSheetClose,
  PremiumSheetContent,
  PremiumSheetHeader,
  PremiumSheetFooter,
  PremiumSheetTitle,
  PremiumSheetDescription,
};
