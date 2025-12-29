import { headers } from "next/headers";
import authConfig from "./auth.config";

export const getSession = authConfig.api.getSession({
  headers : await headers()
})

export type GetSession = Awaited<typeof getSession>