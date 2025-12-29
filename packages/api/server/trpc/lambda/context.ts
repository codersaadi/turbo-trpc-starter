import { authConfig, Session } from "../../auth";
import { getServerDB } from "../../db/server";

interface CreateContextOptions {
  auth: Session | null;
  req?: Request;
  headers?: Headers;
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    ...opts,
    db: getServerDB(),
  };
};

export type Context = Awaited<ReturnType<typeof createInnerTRPCContext>>;

export const createTRPCNextjsContext = async (req: Request) => {
  let auth: Session | null = null;

  try {
    // Get auth from request headers for Next.js
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      headers.set(key, value);
    });

    const session = await authConfig.api.getSession({
      headers,
    });

    if (session) {
      auth = session as Session;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    auth = null;
  }

  return createInnerTRPCContext({
    auth,
    req,
    headers: req.headers,
  });
};
