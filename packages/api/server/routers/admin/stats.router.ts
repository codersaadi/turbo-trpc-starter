import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../../trpc/lambda";
import { users, sessions } from "../../db/schema/better-auth";
import { files } from "../../db/schema/files";
import { sql, gte, and, count, isNull } from "drizzle-orm";

export const adminStatsRouter = createTRPCRouter({
  /**
   * Get dashboard overview stats
   */
  overview: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total users (excluding soft-deleted)
    const [totalUsersResult] = await ctx.db
      .select({ count: count() })
      .from(users)
      .where(isNull(users.deletedAt));

    // Get new users in different time periods
    const [newUsers24hResult] = await ctx.db
      .select({ count: count() })
      .from(users)
      .where(and(gte(users.createdAt, last24h), isNull(users.deletedAt)));

    const [newUsers7dResult] = await ctx.db
      .select({ count: count() })
      .from(users)
      .where(and(gte(users.createdAt, last7d), isNull(users.deletedAt)));

    const [newUsers30dResult] = await ctx.db
      .select({ count: count() })
      .from(users)
      .where(and(gte(users.createdAt, last30d), isNull(users.deletedAt)));

    // Get active sessions count
    const [activeSessionsResult] = await ctx.db
      .select({ count: count() })
      .from(sessions)
      .where(gte(sessions.expiresAt, now));

    // Get verified users count
    const [verifiedUsersResult] = await ctx.db
      .select({ count: count() })
      .from(users)
      .where(and(sql`${users.emailVerified} = true`, isNull(users.deletedAt)));

    // Get banned users count
    const [bannedUsersResult] = await ctx.db
      .select({ count: count() })
      .from(users)
      .where(and(sql`${users.banned} = true`, isNull(users.deletedAt)));

    // Get total files count and size
    const [filesResult] = await ctx.db
      .select({
        count: count(),
        totalSize: sql<number>`COALESCE(SUM(${files.fileSize}), 0)`,
      })
      .from(files);

    return {
      users: {
        total: totalUsersResult?.count ?? 0,
        new24h: newUsers24hResult?.count ?? 0,
        new7d: newUsers7dResult?.count ?? 0,
        new30d: newUsers30dResult?.count ?? 0,
        verified: verifiedUsersResult?.count ?? 0,
        banned: bannedUsersResult?.count ?? 0,
      },
      sessions: {
        active: activeSessionsResult?.count ?? 0,
      },
      files: {
        total: filesResult?.count ?? 0,
        totalSize: Number(filesResult?.totalSize ?? 0),
      },
    };
  }),

  /**
   * Get user growth chart data for last 30 days
   */
  userGrowth: adminProcedure
    .input(
      z
        .object({
          days: z.number().min(7).max(90).default(30),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const days = input?.days ?? 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const result = await ctx.db
        .select({
          date: sql<string>`DATE(${users.createdAt})`,
          count: count(),
        })
        .from(users)
        .where(and(gte(users.createdAt, startDate), isNull(users.deletedAt)))
        .groupBy(sql`DATE(${users.createdAt})`)
        .orderBy(sql`DATE(${users.createdAt})`);

      // Fill in missing dates with 0 count
      const data: { date: string; count: number }[] = [];
      const currentDate = new Date(startDate);
      const now = new Date();

      while (currentDate <= now) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const found = result.find((r) => r.date === dateStr);
        data.push({
          date: dateStr as string,
          count: found?.count ?? 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return data;
    }),

  /**
   * Get recent signups
   */
  recentSignups: adminProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(10),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;

      const recentUsers = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
          createdAt: users.createdAt,
          emailVerified: users.emailVerified,
        })
        .from(users)
        .where(isNull(users.deletedAt))
        .orderBy(sql`${users.createdAt} DESC`)
        .limit(limit);

      return recentUsers;
    }),
});
