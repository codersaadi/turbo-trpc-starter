import "server-only";
import { createTRPCClient } from "@trpc/client";
import { getTRPCLinks } from "./shared";
import { AppRouter } from "@repo/api/server/routers";

// this is for calling the api from server (sdk)
export const lambdaClient = createTRPCClient<AppRouter>({
  links: getTRPCLinks("lambda"),
});
