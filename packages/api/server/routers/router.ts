import { createTRPCRouter } from "../trpc/lambda";
import { authRouter } from "./auth.router";
import { edgeRouter } from "./edge";
import { fileRouter } from "./files.router";
import { adminRouter } from "./admin";

export const appRouter = createTRPCRouter({
  // Core infrastructure
  auth: authRouter,
  edge: edgeRouter,
  file: fileRouter,
  // Admin console
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
