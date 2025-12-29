import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { TooltipProvider } from "@ui-components/ui/tooltip";
import { Toaster } from "@ui-components/ui/sonner";

export function UIProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider enableSystem attribute="class" disableTransitionOnChange>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster />
    </ThemeProvider>
  );
}
