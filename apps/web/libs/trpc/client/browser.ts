import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { shared, getTrpcServerURL } from "./shared";
import { AppRouter } from "@repo/api/server/routers";
export { makeQueryClient } from "../tanstack/client";

// Create a factory function for the browser client that uses dynamic URL
export const createBrowserClient = () =>
  createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        ...shared,
        url: getTrpcServerURL(),
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
