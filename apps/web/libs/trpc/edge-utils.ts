import { EdgeRouter } from "@repo/api/server/routers/edge";
import { createTRPCContext } from "@trpc/tanstack-react-query";

/**
 * Edge tRPC Context for React components
 *
 * This is separate from the main AppRouter context to avoid
 * type conflicts (edge doesn't have `db` in context)
 */
export const {
  TRPCProvider: EdgeTRPCProvider,
  useTRPC: useEdgeTRPC,
  useTRPCClient: useEdgeTRPCClient,
} = createTRPCContext<EdgeRouter>();
