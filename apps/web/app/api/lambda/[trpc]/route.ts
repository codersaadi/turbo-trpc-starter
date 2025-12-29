import { appRouter } from "@repo/api/server/routers";
import { createTRPCNextjsContext } from "@repo/api/server/trpc/lambda";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest } from "next/server";

const handleRequest = async (req: NextRequest) => {
  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("[tRPC Route] Method:", req.method);
    console.log("[tRPC Route] URL:", req.url);
    console.log("[tRPC Route] Headers:", Object.fromEntries(req.headers));

    // Clone request to read body without consuming it
    const clonedReq = req.clone();
    try {
      const body = await clonedReq.text();
      console.log("[tRPC Route] Body:", body);
    } catch (e) {
      console.log("[tRPC Route] Could not read body:", e);
    }
  }

  const response = await fetchRequestHandler({
    endpoint: "/api/lambda",
    req,
    router: appRouter,
    createContext: (opts) => createTRPCNextjsContext(opts.req),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

  // Add CORS headers for local development
  if (process.env.NODE_ENV === "development") {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Cookie, x-trpc-source"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
};

// Handle OPTIONS preflight requests
export async function OPTIONS(req: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, Cookie, x-trpc-source",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  return new Response(null, { status: 204 });
}

export { handleRequest as GET, handleRequest as POST };
