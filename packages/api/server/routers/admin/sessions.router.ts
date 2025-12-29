import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../../trpc/lambda";
import { sessions, users } from "../../db/schema/better-auth";
import { TRPCError } from "@trpc/server";
import { sql, eq, and, count, desc, asc, gte, ilike, or } from "drizzle-orm";

export const adminSessionsRouter = createTRPCRouter({
  /**
   * List all active sessions with pagination
   */
  list: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        userId: z.string().optional(),
        activeOnly: z.boolean().default(true),
        sortBy: z.enum(["createdAt", "expiresAt"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, userId, activeOnly, sortBy, sortOrder } =
        input;
      const offset = (page - 1) * limit;
      const now = new Date();

      // Build where conditions
      const conditions = [];

      if (activeOnly) {
        conditions.push(gte(sessions.expiresAt, now));
      }

      if (userId) {
        conditions.push(eq(sessions.userId, userId));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Build sort
      const sortColumn = {
        createdAt: sessions.createdAt,
        expiresAt: sessions.expiresAt,
      }[sortBy];

      const orderBy = sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn);

      // Get total count
      const [totalResult] = await ctx.db
        .select({ count: count() })
        .from(sessions)
        .where(whereClause);

      // Get sessions with user info
      let query = ctx.db
        .select({
          id: sessions.id,
          token: sessions.token,
          createdAt: sessions.createdAt,
          expiresAt: sessions.expiresAt,
          ipAddress: sessions.ipAddress,
          userAgent: sessions.userAgent,
          userId: sessions.userId,
          impersonatedBy: sessions.impersonatedBy,
          userName: users.name,
          userEmail: users.email,
          userImage: users.image,
        })
        .from(sessions)
        .leftJoin(users, eq(sessions.userId, users.id))
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      const sessionsList = await query;

      // Filter by search term on user name/email if provided
      let filteredSessions = sessionsList;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredSessions = sessionsList.filter(
          (s) =>
            s.userName?.toLowerCase().includes(searchLower) ||
            s.userEmail?.toLowerCase().includes(searchLower) ||
            s.ipAddress?.includes(search),
        );
      }

      const total = totalResult?.count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: filteredSessions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    }),

  /**
   * Get session details
   */
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [session] = await ctx.db
        .select({
          id: sessions.id,
          token: sessions.token,
          createdAt: sessions.createdAt,
          expiresAt: sessions.expiresAt,
          ipAddress: sessions.ipAddress,
          userAgent: sessions.userAgent,
          userId: sessions.userId,
          impersonatedBy: sessions.impersonatedBy,
          userName: users.name,
          userEmail: users.email,
          userImage: users.image,
        })
        .from(sessions)
        .leftJoin(users, eq(sessions.userId, users.id))
        .where(eq(sessions.id, input.id));

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      return session;
    }),

  /**
   * Revoke a single session
   */
  revoke: adminProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(sessions)
        .where(eq(sessions.id, input.sessionId))
        .returning({ id: sessions.id });

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      return { success: true };
    }),

  /**
   * Revoke all sessions for a user
   */
  revokeAllForUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .delete(sessions)
        .where(eq(sessions.userId, input.userId))
        .returning({ id: sessions.id });

      return { success: true, count: result.length };
    }),

  /**
   * Revoke all expired sessions (cleanup)
   */
  revokeExpired: adminProcedure.mutation(async ({ ctx }) => {
    const now = new Date();
    const result = await ctx.db
      .delete(sessions)
      .where(sql`${sessions.expiresAt} < ${now}`)
      .returning({ id: sessions.id });

    return { success: true, count: result.length };
  }),

  /**
   * Get session stats
   */
  stats: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();

    const [activeResult] = await ctx.db
      .select({ count: count() })
      .from(sessions)
      .where(gte(sessions.expiresAt, now));

    const [expiredResult] = await ctx.db
      .select({ count: count() })
      .from(sessions)
      .where(sql`${sessions.expiresAt} < ${now}`);

    const [totalResult] = await ctx.db
      .select({ count: count() })
      .from(sessions);

    return {
      active: activeResult?.count ?? 0,
      expired: expiredResult?.count ?? 0,
      total: totalResult?.count ?? 0,
    };
  }),
});
