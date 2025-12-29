import { GetSession } from "../../auth/get-auth";

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
    // instead we will use better fetch here to get the session
    // const session = await authConfig.api.getSession({
    //   headers
    // });

    // if (session) {
    //   auth = session;
    // }
  } catch (_error) {
    auth = null;
  }

  return createInnerTRPCContext({
    auth,
    req,
    headers: req.headers,
  });
};
