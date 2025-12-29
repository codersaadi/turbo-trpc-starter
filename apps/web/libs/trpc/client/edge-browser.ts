import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { shared } from "./shared";
import { EdgeRouter } from "@repo/api/server/routers/edge";
import { getPublicFrontendUrl } from "@repo/env";

/**
 * Get the edge tRPC server URL for browser
 */
export const getEdgeTrpcBrowserURL = () => {
  return `${getPublicFrontendUrl()}/api/edge`;
};

/**
 * Create Edge tRPC browser client
 *
 * This client is for calling the edge API from the browser.
 * It runs on the edge runtime for ultra-low latency.
 *
 * Usage:
 * ```ts
 * import { createEdgeBrowserClient } from '@/libs/trpc/client/edge-browser';
 *
 * const edgeClient = createEdgeBrowserClient();
 * const flags = await edgeClient.featureFlags.getAll.query();
 * ```
 */
export const createEdgeBrowserClient = () =>
  createTRPCClient<EdgeRouter>({
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
      }),
      httpBatchLink({
        ...shared,
        url: getEdgeTrpcBrowserURL(),
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            credentials: "include",
            signal: AbortSignal.timeout(15000), // 15 second timeout
          });
        },
      }),
    ],
  });
