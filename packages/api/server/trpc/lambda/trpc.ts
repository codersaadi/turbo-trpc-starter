import { transformer } from "../../../transformer";
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";

import { Context } from "./context";

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: transformer,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Base router and procedure
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Middleware to check if user is authenticated
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.auth?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth,
    },
  });
});

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
// Middleware to check if user is admin
const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (ctx.auth?.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth,
    },
  });
});

// Admin procedure that requires admin role
export const adminProcedure = protectedProcedure.use(enforceUserIsAdmin);
