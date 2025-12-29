import { GetSession } from "../../auth/get-auth";
import { betterFetch } from "@better-fetch/fetch";

interface CreateContextOptions {
  auth: GetSession | null;
  req?: Request;
  headers?: Headers;
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    ...opts,
  };
};

export type Context = Awaited<ReturnType<typeof createInnerTRPCContext>>;

export const createTRPCEdgeContext = async (req: Request) => {
  let auth: GetSession | null = null;

  try {
    // Get auth from request headers for Next.js
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      headers.set(key, value);
    });
    const baseURL = new URL(req.url).origin;

    const { data: session } = (await betterFetch("/api/auth/get-session", {
      baseURL,
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    })) as { data: GetSession | null };

    if (session) {
      auth = session;
    }
  } catch (_error) {
    auth = null;
  }

  return createInnerTRPCContext({
    auth,
    req,
    headers: req.headers,
  });
};
