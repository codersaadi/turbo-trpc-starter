import { systemRouter } from "./system.router";
import { featureFlagsRouter } from "./feature-flags.router";
import { createTRPCRouter } from "../../trpc/edge";

export const edgeRouter = createTRPCRouter({
  system: systemRouter,
  featureFlags: featureFlagsRouter,
});

export type EdgeRouter = typeof edgeRouter;
