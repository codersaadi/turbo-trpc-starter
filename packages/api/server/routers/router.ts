import { createTRPCRouter } from "../trpc/lambda";
import { authRouter } from "./auth.router";
import { edgeRouter } from "./edge";
import { fileRouter } from "./files.router";

export const appRouter = createTRPCRouter({
  // Core infrastructure
  auth: authRouter,
  edge: edgeRouter,
  file: fileRouter,
});

export type AppRouter = typeof appRouter;
