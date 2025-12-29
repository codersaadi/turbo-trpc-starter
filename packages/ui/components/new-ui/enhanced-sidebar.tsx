"use client";

import * as React from "react";
import { PanelLeftClose, PanelRightClose } from "lucide-react";

import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/ui/button";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined,
);

export function useEnhancedSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error(
      "useEnhancedSidebar must be used within an EnhancedSidebar",
    );
  }
  return context;
}

interface EnhancedSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultCollapsed?: boolean;
  collapsible?: boolean;
}

const EnhancedSidebar = React.forwardRef<HTMLDivElement, EnhancedSidebarProps>(
  (
    {
      className,
      children,
      defaultCollapsed = false,
      collapsible = true,
      ...props
    },
    ref,
  ) => {
    const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

    return (
      <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
        <div
          ref={ref}
          data-collapsed={collapsed}
          className={cn(
            "group flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-md transition-all duration-300 ease-in-out",
            collapsed ? "w-20" : "w-70",
            className,
          )}
          {...props}
        >
          {collapsible && (
            <div className="absolute -right-3 top-6 z-20">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-full border shadow-md"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? (
                  <PanelRightClose className="h-3 w-3" />
                ) : (
                  <PanelLeftClose className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}
          {children}
        </div>
      </SidebarContext.Provider>
    );
  },
);
EnhancedSidebar.displayName = "EnhancedSidebar";

const EnhancedSidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { collapsed } = useEnhancedSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-16 items-center border-b border-border/40 px-6",
        collapsed && "justify-center px-2",
        className,
      )}
      {...props}
    />
  );
});
EnhancedSidebarHeader.displayName = "EnhancedSidebarHeader";

const EnhancedSidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto py-4", className)}
    {...props}
  />
));
EnhancedSidebarContent.displayName = "EnhancedSidebarContent";

const EnhancedSidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { collapsed } = useEnhancedSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center border-t border-border/40 p-4",
        collapsed ? "justify-center" : "justify-between",
        className,
      )}
      {...props}
    />
  );
});
EnhancedSidebarFooter.displayName = "EnhancedSidebarFooter";

interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ElementType;
  active?: boolean;
}

const EnhancedSidebarItem = React.forwardRef<
  HTMLButtonElement,
  SidebarItemProps
>(({ className, icon: Icon, active, children, ...props }, ref) => {
  const { collapsed } = useEnhancedSidebar();

  return (
    <button
      ref={ref}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground mx-auto",
        active && "bg-accent text-accent-foreground",
        collapsed ? "justify-center px-2 w-[80%] aspect-square" : "mx-2 w-auto",
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" />}
      {!collapsed && <span>{children}</span>}
    </button>
  );
});
EnhancedSidebarItem.displayName = "EnhancedSidebarItem";

export {
  EnhancedSidebar,
  EnhancedSidebarHeader,
  EnhancedSidebarContent,
  EnhancedSidebarFooter,
  EnhancedSidebarItem,
};
