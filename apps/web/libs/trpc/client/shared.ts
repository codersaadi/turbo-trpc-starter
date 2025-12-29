import { transformer } from "@repo/api/transformer";
import { getPublicFrontendUrl } from "@repo/env";
import {
  httpBatchLink,
  loggerLink,
  type HTTPBatchLinkOptions,
} from "@trpc/client";
import { ClientTypes } from "@repo/api/server/routers/types";

export const shared = {
  maxURLLength: 2083,
  transformer: transformer,
} satisfies Partial<HTTPBatchLinkOptions<ClientTypes>>;

/**
 * Gets the appropriate tRPC server URL based on the current mode
 * In embedded mode, it uses the internal Next.js API routes
 * In normal mode, it uses the external API URL
 */
export const getTrpcServerURL = (runtime: "lambda" | "edge" = "lambda") => {
  return `${getPublicFrontendUrl()}/api/${runtime}`;
};

// For backwards compatibility
/**
 * Creates tRPC links with dynamic URL resolution
 * This ensures the URL is resolved at runtime, not build time
 */
export const createTrpcLinks = () => [
  loggerLink({
    enabled: (opts) =>
      process.env.NODE_ENV === "development" ||
      (opts.direction === "down" && opts.result instanceof Error),
  }),
  httpBatchLink({
    ...shared,
    url: getTrpcServerURL(),
    // Include credentials for auth cookies
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  }),
];

export const getTRPCLinks = (runtime: "lambda" | "edge") => {
  return [
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === "development" ||
        (opts.direction === "down" && opts.result instanceof Error),
    }),
    httpBatchLink({
      ...shared,
      url: getTrpcServerURL(runtime),
      headers: async () => {
        try {
          const forwardHeaders: Record<string, string> = {};
          const cookies = (await import("next/headers")).cookies();
          const cookie = cookies.toString();
          forwardHeaders["cookie"] = cookie;
          return forwardHeaders;
        } catch (error) {
          console.warn("Failed to get headers in lambda client:", error);
          return {};
        }
      },
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ];
};
