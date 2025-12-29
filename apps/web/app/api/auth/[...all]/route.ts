import { authConfig } from "@repo/api/server/auth";
import { toNextJsHandler } from "better-auth/next-js";
export const { GET, POST } = toNextJsHandler(authConfig.handler);
