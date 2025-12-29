import React from "react";
import { LambdaQueryProvider } from "./query-provider";
import { EdgeQueryProvider } from "./edge-query-provider";
import { UIProvider } from "./ui-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

interface GlobalLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

/**
 * Root Provider
 *
 * Provides both Lambda (main API with DB) and Edge (feature flags, system) tRPC clients
 */
export default function AppLayout({ children, modal }: GlobalLayoutProps) {
  return (
    <NuqsAdapter>
      <UIProvider>
        <LambdaQueryProvider>
          <EdgeQueryProvider>
            {children}
            {modal}
          </EdgeQueryProvider>
        </LambdaQueryProvider>
      </UIProvider>
    </NuqsAdapter>
  );
}
