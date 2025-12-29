import { createTRPCRouter } from "../../trpc/lambda";
import { adminStatsRouter } from "./stats.router";
import { adminUsersRouter } from "./users.router";
import { adminSessionsRouter } from "./sessions.router";
import { adminFilesRouter } from "./files.router";

export const adminRouter = createTRPCRouter({
  stats: adminStatsRouter,
  users: adminUsersRouter,
  sessions: adminSessionsRouter,
  files: adminFilesRouter,
});

export type AdminRouter = typeof adminRouter;
