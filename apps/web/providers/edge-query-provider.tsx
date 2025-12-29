"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { makeQueryClient } from "libs/trpc";
import { createEdgeBrowserClient } from "../libs/trpc/client/edge-browser";
import { useState } from "react";
import { EdgeTRPCProvider } from "../libs/trpc/edge-utils";

/**
 * Edge Query Provider
 *
 * Provides tRPC client for edge runtime endpoints (feature flags, system, etc.)
 * Separate from LambdaQueryProvider to avoid type conflicts (edge has no db)
 *
 * Usage:
 * ```tsx
 * import { EdgeQueryProvider } from '@/components/edge-query-provider';
 *
 * export default function Layout({ children }) {
 *   return (
 *     <EdgeQueryProvider>
 *       {children}
 *     </EdgeQueryProvider>
 *   );
 * }
 * ```
 */

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: reuse existing query client
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

export function EdgeQueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [edgeTrpcClient] = useState(() => createEdgeBrowserClient());

  return (
    <QueryClientProvider client={queryClient}>
      <EdgeTRPCProvider trpcClient={edgeTrpcClient} queryClient={queryClient}>
        {children}
      </EdgeTRPCProvider>
    </QueryClientProvider>
  );
}
