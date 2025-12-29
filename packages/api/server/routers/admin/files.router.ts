import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../../trpc/lambda";
import { files, fileTypeEnum } from "../../db/schema/files";
import { users } from "../../db/schema/better-auth";
import { TRPCError } from "@trpc/server";
import { sql, eq, and, count, desc, asc, ilike } from "drizzle-orm";

// File type values from the enum
const fileTypes = ["license", "attachment", "avatar", "general"] as const;
type FileType = (typeof fileTypes)[number];

export const adminFilesRouter = createTRPCRouter({
  /**
   * List files with pagination and filters
   */
  list: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        type: z.enum(fileTypes).optional(),
        uploaderId: z.string().optional(),
        sortBy: z
          .enum(["createdAt", "fileSize", "originalFilename"])
          .default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, type, uploaderId, sortBy, sortOrder } =
        input;
      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions = [];

      if (search) {
        conditions.push(ilike(files.originalFilename, `%${search}%`));
      }

      if (type) {
        conditions.push(eq(files.fileType, type));
      }

      if (uploaderId) {
        conditions.push(eq(files.uploadedBy, uploaderId));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Build sort
      const sortColumn = {
        createdAt: files.createdAt,
        fileSize: files.fileSize,
        originalFilename: files.originalFilename,
      }[sortBy];

      const orderBy = sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn);

      // Get total count
      const [totalResult] = await ctx.db
        .select({ count: count() })
        .from(files)
        .where(whereClause);

      // Get files with uploader info
      const filesList = await ctx.db
        .select({
          id: files.id,
          fileName: files.originalFilename,
          fileSize: files.fileSize,
          fileType: files.fileType,
          contentType: files.contentType,
          r2Key: files.r2Key,
          publicUrl: files.publicUrl,
          uploaderId: files.uploadedBy,
          createdAt: files.createdAt,
          updatedAt: files.updatedAt,
          uploaderName: users.name,
          uploaderEmail: users.email,
        })
        .from(files)
        .leftJoin(users, eq(files.uploadedBy, users.id))
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      const total = totalResult?.count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: filesList,
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
   * Get file details
   */
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [file] = await ctx.db
        .select({
          id: files.id,
          fileName: files.originalFilename,
          fileSize: files.fileSize,
          fileType: files.fileType,
          contentType: files.contentType,
          r2Key: files.r2Key,
          publicUrl: files.publicUrl,
          uploaderId: files.uploadedBy,
          createdAt: files.createdAt,
          updatedAt: files.updatedAt,
          uploaderName: users.name,
          uploaderEmail: users.email,
        })
        .from(files)
        .leftJoin(users, eq(files.uploadedBy, users.id))
        .where(eq(files.id, input.id));

      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      return file;
    }),

  /**
   * Delete a file
   */
  delete: adminProcedure
    .input(z.object({ fileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(files)
        .where(eq(files.id, input.fileId))
        .returning({ id: files.id, r2Key: files.r2Key });

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      // TODO: Also delete from R2 storage
      // This would require importing and using the R2 module

      return { success: true };
    }),

  /**
   * Get storage stats
   */
  stats: adminProcedure.query(async ({ ctx }) => {
    const [result] = await ctx.db
      .select({
        totalFiles: count(),
        totalSize: sql<number>`COALESCE(SUM(${files.fileSize}), 0)`,
      })
      .from(files);

    // Get breakdown by file type
    const byType = await ctx.db
      .select({
        fileType: files.fileType,
        count: count(),
        size: sql<number>`COALESCE(SUM(${files.fileSize}), 0)`,
      })
      .from(files)
      .groupBy(files.fileType);

    return {
      totalFiles: result?.totalFiles ?? 0,
      totalSize: Number(result?.totalSize ?? 0),
      byType: byType.map((t) => ({
        type: t.fileType,
        count: t.count,
        size: Number(t.size),
      })),
    };
  }),
});
