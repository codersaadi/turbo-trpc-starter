import {
  eq,
  desc,
  count,
  sql,
  and,
  like,
  gte,
  lte,
  inArray,
} from "drizzle-orm";
import { files, type FileRecord, type FileInsert, users } from "../db/schema";
import { TRPCError } from "@trpc/server";
import { BaseDAL } from "./base";

// ============================================================================
// SIMPLIFIED FILE DAL
// ============================================================================

export class FileDAL extends BaseDAL {
  // CREATE operations
  async createFile(data: FileInsert): Promise<FileRecord> {
    try {
      const [file] = await this.db.insert(files).values(data).returning();
      if (!file) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create file record",
        });
      }
      return file;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database error while creating file",
      });
    }
  }

  // READ operations
  async getFileById(id: string): Promise<FileRecord | null> {
    try {
      const [file] = await this.db.select().from(files).where(eq(files.id, id));
      return file || null;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database error while fetching file",
      });
    }
  }

  // DELETE operations
  async deleteFile(id: string): Promise<void> {
    try {
      await this.db.delete(files).where(eq(files.id, id));
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database error while deleting file",
      });
    }
  }

  // ============================================================================
  // ADMIN OPERATIONS
  // ============================================================================

  async getAllFiles(
    options: {
      limit?: number;
      offset?: number;
      search?: string;
      uploaderId?: string;
      startDate?: Date;
      endDate?: Date;
      orderBy?: "createdAt" | "fileSize" | "originalFilename";
      orderDir?: "asc" | "desc";
    } = {}
  ) {
    try {
      const {
        limit = 50,
        offset = 0,
        search,
        uploaderId,
        startDate,
        endDate,
        orderBy = "createdAt",
        orderDir = "desc",
      } = options;

      // Build where conditions
      const conditions = [];

      if (search) {
        conditions.push(like(files.originalFilename, `%${search}%`));
      }

      if (uploaderId) {
        conditions.push(eq(files.uploadedBy, uploaderId));
      }

      if (startDate) {
        conditions.push(gte(files.createdAt, startDate));
      }

      if (endDate) {
        conditions.push(lte(files.createdAt, endDate));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get data with joins
      const data = await this.db
        .select({
          id: files.id,
          r2Key: files.r2Key,
          originalFilename: files.originalFilename,
          fileSize: files.fileSize,
          publicUrl: files.publicUrl,
          uploadedBy: files.uploadedBy,
          createdAt: files.createdAt,
          uploaderName: users.name,
          uploaderEmail: users.email,
        })
        .from(files)
        .leftJoin(users, eq(files.uploadedBy, users.id))
        .where(whereClause)
        .orderBy(orderDir === "desc" ? desc(files[orderBy]) : files[orderBy])
        .limit(limit)
        .offset(offset);

      // Get total count
      const totalResult = await this.db
        .select({ total: count() })
        .from(files)
        .where(whereClause);

      const total = totalResult[0]?.total || 0;

      return { data, total };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database error while fetching files",
      });
    }
  }

  async getFilesByUser(userId: string): Promise<FileRecord[]> {
    try {
      return await this.db
        .select()
        .from(files)
        .where(eq(files.uploadedBy, userId))
        .orderBy(desc(files.createdAt));
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database error while fetching user files",
      });
    }
  }

  async getFileStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    recentUploads: number; // last 7 days
    averageFileSize: number;
  }> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const statsResult = await this.db
        .select({
          totalFiles: count(),
          totalSize: sql<number>`COALESCE(SUM(${files.fileSize}), 0)`,
          averageFileSize: sql<number>`COALESCE(AVG(${files.fileSize}), 0)`,
        })
        .from(files);

      const recentUploadsResult = await this.db
        .select({ recentUploads: count() })
        .from(files)
        .where(gte(files.createdAt, sevenDaysAgo));

      const stats = statsResult[0];
      const recentUploads = recentUploadsResult[0]?.recentUploads || 0;

      if (!stats) {
        return {
          totalFiles: 0,
          totalSize: 0,
          recentUploads: 0,
          averageFileSize: 0,
        };
      }

      return {
        totalFiles: stats.totalFiles,
        totalSize: Number(stats.totalSize),
        recentUploads,
        averageFileSize: Number(stats.averageFileSize),
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database error while fetching file stats",
      });
    }
  }

  async bulkDeleteFiles(ids: string[]): Promise<{ deleted: number }> {
    try {
      if (ids.length === 0) return { deleted: 0 };

      const result = await this.db.delete(files).where(inArray(files.id, ids));

      return { deleted: result.rowCount || 0 };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database error while bulk deleting files",
      });
    }
  }
}
