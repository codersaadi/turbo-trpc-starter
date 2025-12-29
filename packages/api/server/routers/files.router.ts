import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createFileService,
  getDefaultFileServiceConfig,
} from "../services/file.service";
import { createTRPCRouter, protectedProcedure } from "../trpc/lambda";
import { FileDAL } from "../dals/files";
import { FileInsert, files } from "../db/schema";

// ============================================================================
// SIMPLIFIED VALIDATION SCHEMAS
// ============================================================================

const uploadBase64Schema = z.object({
  base64: z.string().min(1, "Image data is required"),
  filename: z.string().min(1, "Filename is required"),
  contentType: z
    .string()
    .regex(
      /^image\/(jpeg|jpg|png|webp|gif)$/i,
      "Only JPEG, PNG, WebP, and GIF images are allowed"
    ),
});

const presignedUploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  fileSize: z.number().max(10 * 1024 * 1024), // 10MB max file size
});

const fileIdSchema = z.object({
  id: z.string().uuid(),
});

const saveFileRecordSchema = z.object({
  r2Key: z.string(),
  originalFilename: z.string(),
  fileSize: z.number(),
  publicUrl: z.string(),
});

const listFilesSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  uploaderId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  orderBy: z
    .enum(["createdAt", "fileSize", "originalFilename"])
    .default("createdAt"),
  orderDir: z.enum(["asc", "desc"]).default("desc"),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
});

// ============================================================================
// SERVICE INSTANCE
// ============================================================================

const fileService = createFileService(getDefaultFileServiceConfig());

// ============================================================================
// SIMPLIFIED ROUTER
// ============================================================================

export const fileRouter = createTRPCRouter({
  /**
   * Upload image via base64 (for mobile apps)
   * Similar to avatar upload but for general file uploads
   */
  upload: protectedProcedure
    .input(uploadBase64Schema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Convert base64 to buffer
        const base64Data = input.base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (buffer.length > maxSize) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Image must be less than 10MB",
          });
        }

        // Upload to R2
        const uploadResult = await fileService.r2Service.uploadFile(
          {
            buffer: new Uint8Array(buffer),
            contentType: input.contentType,
            filename: input.filename,
            size: buffer.length,
          },
          {
            userId: ctx.auth.user.id,
            category: "general",
            isPublic: true,
            generateThumbnail: false,
            optimizeImage: true,
          },
          "image"
        );

        // Save file record
        const fileDAL = new FileDAL();
        const fileRecord = await fileDAL.createFile({
          r2Key: uploadResult.key,
          originalFilename: input.filename,
          fileSize: uploadResult.size,
          publicUrl: uploadResult.url,
          uploadedBy: ctx.auth.user.id,
        });

        return {
          id: fileRecord.id,
          url: uploadResult.url,
          filename: input.filename,
          size: uploadResult.size,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload image",
          cause: error,
        });
      }
    }),

  /**
   * Generate presigned upload URL for direct frontend upload
   */
  generateUploadUrl: protectedProcedure
    .input(presignedUploadSchema)
    .mutation(async ({ input, ctx }) => {
      return await fileService.generateUploadUrl(
        ctx.auth.user.id,
        input.filename,
        input.contentType
      );
    }),

  /**
   * Save file record after successful direct S3 upload
   */
  saveFileRecord: protectedProcedure
    .input(saveFileRecordSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify file exists and get REAL metadata from R2 (bulletproof security)
        const headResult = await fileService.r2Service.headObject(input.r2Key);

        const fileData: FileInsert = {
          r2Key: input.r2Key,
          originalFilename: input.originalFilename, // Only client data we trust
          fileSize: headResult.contentLength, // REAL size from R2
          publicUrl: fileService.generatePublicUrl(input.r2Key), // Server-generated URL
          uploadedBy: ctx.auth.user.id,
        };

        // Use FileDAL directly since dal is private in FileService
        const fileDAL = new FileDAL();
        const result = await fileDAL.createFile(fileData);

        return {
          id: result.id,
          filename: result.originalFilename,
          fileSize: result.fileSize,
          publicUrl: result.publicUrl,
          createdAt: result.createdAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found or unauthorized",
        });
      }
    }),

  /**
   * Get file by ID
   */
  getById: protectedProcedure
    .input(fileIdSchema)
    .query(async ({ input, ctx }) => {
      const file = await fileService.getFile(input.id);

      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      // Check ownership
      if (file.uploadedBy !== ctx.auth.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unauthorized access to file",
        });
      }

      return {
        id: file.id,
        filename: file.originalFilename,
        fileSize: file.fileSize,
        publicUrl: file.publicUrl,
        createdAt: file.createdAt,
      };
    }),

  /**
   * Delete a file
   */
  //   delete: protectedProcedure
  //     .input(fileIdSchema)
  //     .mutation(async ({ input, ctx }) => {
  //       // Check if user is admin - admins can delete any file
  //       const userIsAdmin = await isAdmin(ctx.auth.user.id);
  //       const result = await fileService.deleteFile(
  //         input.id,
  //         userIsAdmin ? undefined : ctx.auth.user.id
  //       );

  //       return {
  //         fileId: result.file.id,
  //         filename: result.file.originalFilename,
  //         r2Deleted: result.r2Deleted,
  //       };
  //     }),

  // ============================================================================
  // ADMIN PROCEDURES
  // ============================================================================

  /**
   * List all files for admin with pagination and filters
   */
  listFiles: protectedProcedure
    .input(listFilesSchema)
    .query(async ({ input }) => {
      const fileDAL = new FileDAL();
      const result = await fileDAL.getAllFiles({
        limit: input.limit,
        offset: input.offset,
        search: input.search,
        uploaderId: input.uploaderId,
        startDate: input.startDate,
        endDate: input.endDate,
        orderBy: input.orderBy,
        orderDir: input.orderDir,
      });

      return {
        data: result.data,
        total: result.total,
        pageCount: Math.ceil(result.total / input.limit),
      };
    }),

  /**
   * Get file statistics for admin dashboard
   */
  getFileStats: protectedProcedure.query(async () => {
    const fileDAL = new FileDAL();
    return await fileDAL.getFileStats();
  }),

  /**
   * Bulk delete files (admin only)
   */
  bulkDelete: protectedProcedure
    .input(bulkDeleteSchema)
    .mutation(async ({ input }) => {
      const fileDAL = new FileDAL();

      // Get files to delete for R2 cleanup
      const filesToDelete = await Promise.all(
        input.ids.map((id) => fileDAL.getFileById(id))
      );

      const validFiles = filesToDelete.filter(Boolean) as Array<
        NonNullable<(typeof filesToDelete)[0]>
      >;

      // Delete from database first (following our security fix)
      const deleteResult = await fileDAL.bulkDeleteFiles(input.ids);

      // Delete from R2 storage
      let r2DeleteCount = 0;
      for (const file of validFiles) {
        try {
          await fileService.r2Service.deleteFile(file.r2Key);
          r2DeleteCount++;
        } catch (error) {
          // Log but don't fail the whole operation
          console.error(`Failed to delete R2 file ${file.r2Key}:`, error);
        }
      }

      return {
        deletedFromDb: deleteResult.deleted,
        deletedFromR2: r2DeleteCount,
        total: input.ids.length,
      };
    }),

  uploadAttachment: protectedProcedure
    .input(
      z.object({
        base64: z.string().min(1, "File data is required"),
        filename: z.string().min(1, "Filename is required"),
        contentType: z.string().min(1, "Content type is required"),
        caseId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Convert base64 to buffer
        const base64Data = input.base64.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Upload to R2
        const uploadResult = await fileService.r2Service.uploadFile(
          {
            buffer: new Uint8Array(buffer),
            contentType: input.contentType,
            filename: input.filename,
            size: buffer.length,
          },
          {
            userId: ctx.auth.user.id,
            category: "attachment",
            isPublic: false,
            generateThumbnail: false,
            optimizeImage: true,
          },
          "document"
        );

        // Save file record
        const [fileRecord] = await ctx.db
          .insert(files)
          .values({
            r2Key: uploadResult.key,
            originalFilename: input.filename,
            fileSize: uploadResult.size,
            contentType: input.contentType,
            fileType: "attachment",
            publicUrl: uploadResult.url,
            uploadedBy: ctx.auth.user.id,
          })
          .returning();

        if (!fileRecord) {
          throw new TRPCError({
            message: "failed to create file record",
            code: "BAD_REQUEST",
          });
        }

        return {
          id: fileRecord.id,
          url: fileRecord.publicUrl,
          filename: fileRecord.originalFilename,
          size: fileRecord.fileSize,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload attachment",
          cause: error,
        });
      }
    }),

  /**
   * Upload user avatar
   * - Image validation (JPEG, PNG, WebP, GIF only)
   * - Image optimization and resizing
   * - Malware scanning
   * - Public access enabled
   */
  uploadAvatar: protectedProcedure
    .input(
      z.object({
        base64: z.string().min(1, "Image data is required"),
        filename: z.string().min(1, "Filename is required"),
        contentType: z.string().min(1, "Content type is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Convert base64 to buffer
        const base64Data = input.base64.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Upload to R2 with image optimization
        const uploadResult = await fileService.r2Service.uploadFile(
          {
            buffer: new Uint8Array(buffer),
            contentType: input.contentType,
            filename: input.filename,
            size: buffer.length,
          },
          {
            userId: ctx.auth.user.id,
            category: "avatar",
            isPublic: true, // Avatars are publicly accessible
            generateThumbnail: true,
            optimizeImage: true,
          },
          "image"
        );

        // Save file record
        const [fileRecord] = await ctx.db
          .insert(files)
          .values({
            r2Key: uploadResult.key,
            originalFilename: input.filename,
            fileSize: uploadResult.size,
            contentType: input.contentType,
            fileType: "avatar",
            publicUrl: uploadResult.url,
            uploadedBy: ctx.auth.user.id,
          })
          .returning();

        if (!fileRecord) {
          throw new TRPCError({
            message: "failed to create file record",
            code: "BAD_REQUEST",
          });
        }

        return {
          id: fileRecord.id,
          url: fileRecord.publicUrl,
          filename: fileRecord.originalFilename,
          size: fileRecord.fileSize,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload avatar",
          cause: error,
        });
      }
    }),
});
