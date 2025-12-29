import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../../trpc/lambda";
import { users, sessions, accounts } from "../../db/schema/better-auth";
import { TRPCError } from "@trpc/server";
import {
  sql,
  eq,
  and,
  or,
  count,
  isNull,
  desc,
  asc,
  ilike,
  not,
} from "drizzle-orm";

const userRoles = ["user", "admin", "moderator"] as const;

export const adminUsersRouter = createTRPCRouter({
  /**
   * List users with pagination, search, and filters
   */
  list: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        role: z.enum(userRoles).optional(),
        status: z.enum(["active", "banned", "unverified"]).optional(),
        sortBy: z
          .enum(["createdAt", "name", "email", "updatedAt"])
          .default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, role, status, sortBy, sortOrder } = input;
      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions = [isNull(users.deletedAt)];

      if (search) {
        conditions.push(
          or(
            ilike(users.name, `%${search}%`),
            ilike(users.email, `%${search}%`),
            ilike(users.username, `%${search}%`),
          ) as ReturnType<typeof isNull>,
        );
      }

      if (role) {
        conditions.push(eq(users.role, role));
      }

      if (status === "banned") {
        conditions.push(eq(users.banned, true));
      } else if (status === "unverified") {
        conditions.push(eq(users.emailVerified, false));
      } else if (status === "active") {
        conditions.push(eq(users.isActive, true));
        conditions.push(
          or(eq(users.banned, false), isNull(users.banned)) as ReturnType<
            typeof isNull
          >,
        );
      }

      const whereClause = and(...conditions);
      // Build sort
      const sortColumn = {
        createdAt: users.createdAt,
        name: users.name,
        email: users.email,
        updatedAt: users.updatedAt,
      }[sortBy];

      const orderBy = sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn);

      // Get total count
      const [totalResult] = await ctx.db
        .select({ count: count() })
        .from(users)
        .where(whereClause);

      // Get users
      const usersList = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
          role: users.role,
          emailVerified: users.emailVerified,
          banned: users.banned,
          banReason: users.banReason,
          isActive: users.isActive,
          isVerified: users.isVerified,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      const total = totalResult?.count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: usersList,
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
   * Get single user details
   */
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: and(eq(users.id, input.id), isNull(users.deletedAt)),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Get user's accounts (providers)
      const userAccounts = await ctx.db
        .select({
          id: accounts.id,
          providerId: accounts.providerId,
          createdAt: accounts.createdAt,
        })
        .from(accounts)
        .where(eq(accounts.userId, input.id));

      // Get active sessions count
      const [sessionsResult] = await ctx.db
        .select({ count: count() })
        .from(sessions)
        .where(
          and(
            eq(sessions.userId, input.id),
            sql`${sessions.expiresAt} > NOW()`,
          ),
        );

      return {
        ...user,
        accounts: userAccounts,
        activeSessions: sessionsResult?.count ?? 0,
      };
    }),

  /**
   * Update user role
   */
  updateRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(userRoles),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Prevent self-demotion
      if (ctx.auth?.user?.id === input.userId && input.role !== "admin") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change your own admin role",
        });
      }

      const [updated] = await ctx.db
        .update(users)
        .set({
          role: input.role,
          updatedAt: new Date(),
        })
        .where(and(eq(users.id, input.userId), isNull(users.deletedAt)))
        .returning({ id: users.id });

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return { success: true };
    }),

  /**
   * Ban/Unban user
   */
  setBanStatus: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        banned: z.boolean(),
        banReason: z.string().optional(),
        banExpires: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Prevent self-ban
      if (ctx.auth?.user?.id === input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot ban yourself",
        });
      }

      const [updated] = await ctx.db
        .update(users)
        .set({
          banned: input.banned,
          banReason: input.banned ? input.banReason : null,
          banExpires: input.banned ? input.banExpires : null,
          updatedAt: new Date(),
        })
        .where(and(eq(users.id, input.userId), isNull(users.deletedAt)))
        .returning({ id: users.id });

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // If banning, revoke all active sessions
      if (input.banned) {
        await ctx.db.delete(sessions).where(eq(sessions.userId, input.userId));
      }

      return { success: true };
    }),

  /**
   * Update user details
   */
  update: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        isActive: z.boolean().optional(),
        isVerified: z.boolean().optional(),
        emailVerified: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, ...updates } = input;

      // Check if email is being changed and is unique
      if (updates.email) {
        const existing = await ctx.db.query.users.findFirst({
          where: and(
            eq(users.email, updates.email),
            sql`${users.id} != ${userId}`,
          ),
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use",
          });
        }
      }

      const [updated] = await ctx.db
        .update(users)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(and(eq(users.id, userId), isNull(users.deletedAt)))
        .returning({ id: users.id });

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return { success: true };
    }),

  /**
   * Soft delete user
   */
  delete: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Prevent self-deletion
      if (ctx.auth?.user?.id === input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete yourself",
        });
      }

      const [deleted] = await ctx.db
        .update(users)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(users.id, input.userId), isNull(users.deletedAt)))
        .returning({ id: users.id });

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Revoke all sessions
      await ctx.db.delete(sessions).where(eq(sessions.userId, input.userId));

      return { success: true };
    }),

  /**
   * Revoke all sessions for a user
   */
  revokeSessions: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(sessions).where(eq(sessions.userId, input.userId));
      return { success: true };
    }),
});
