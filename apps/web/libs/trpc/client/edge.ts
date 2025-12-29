import "server-only";
import { createTRPCClient } from "@trpc/client";
import { getTRPCLinks } from "./shared";
import { EdgeRouter } from "@repo/api/server/routers/edge";

// this is for calling the api from server (sdk)
export const edgeClient = createTRPCClient<EdgeRouter>({
  links: getTRPCLinks("edge"),
});
