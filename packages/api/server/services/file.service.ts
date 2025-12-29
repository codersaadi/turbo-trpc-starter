import { TRPCError } from "@trpc/server";
import {
  type UploadOptions,
  type FileUpload,
  R2StorageService,
  createR2StorageService,
} from "../libs/r2";
import { FileDAL } from "../dals/files";
import { FileInsert, FileRecord } from "../db/schema";

// ============================================================================
// SIMPLIFIED TYPES & INTERFACES
// ============================================================================

interface FileServiceConfig {
  r2Config: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    publicUrl?: string;
    region?: string;
  };
  maxFileSize: number; // bytes
}

export interface FileUploadRequest {
  file: FileUpload;
}

// ============================================================================
// SIMPLIFIED FILE SERVICE CLASS
// ============================================================================

export class FileService {
  private dal: FileDAL;
  public r2Service: R2StorageService; // Make public for headObject access
  private config: FileServiceConfig;

  constructor(config: FileServiceConfig) {
    this.config = config;
    this.dal = new FileDAL();
    this.r2Service = createR2StorageService({
      ...config.r2Config,
      region: config.r2Config.region || "auto",
    });
  }

  /**
   * Upload a single image file
   */
  async uploadFile(
    userId: string,
    request: FileUploadRequest
  ): Promise<FileRecord> {
    try {
      // Validate file size
      if (request.file.size > this.config.maxFileSize) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `File size exceeds maximum allowed size of ${this.formatFileSize(this.config.maxFileSize)}`,
        });
      }

      // Validate it's an image
      if (!request.file.contentType.startsWith("image/")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only image files are allowed",
        });
      }

      // Upload to R2
      const uploadOptions: UploadOptions = {
        userId,
        category: "recipes",
        isPublic: true,
        generateThumbnail: false,
        optimizeImage: true,
      };

      const uploadResult = await this.r2Service.uploadFile(
        request.file,
        {
          ...uploadOptions,
          generateThumbnail: false,
          optimizeImage: true,
        },
        "image"
      );

      // Create file record
      const fileData: FileInsert = {
        r2Key: uploadResult.key,
        originalFilename: request.file.filename,
        fileSize: uploadResult.size,
        publicUrl: uploadResult.url,
        uploadedBy: userId,
      };

      return await this.dal.createFile(fileData);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `File upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string): Promise<FileRecord | null> {
    return await this.dal.getFileById(fileId);
  }

  /**
   * Delete file and clean up R2 storage
   */
  async deleteFile(
    fileId: string,
    userId?: string
  ): Promise<{ file: FileRecord; r2Deleted: boolean }> {
    const file = await this.dal.getFileById(fileId);
    if (!file) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "File not found",
      });
    }

    // Check ownership if userId provided
    if (userId && file.uploadedBy !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not authorized to delete this file",
      });
    }

    let r2Deleted = false;

    try {
      // Delete from database first
      await this.dal.deleteFile(file.id);
      // Delete from R2 storage
      await this.r2Service.deleteFile(file.r2Key);
      r2Deleted = true;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete file",
      });
    }

    return { file, r2Deleted };
  }

  /**
   * Generate presigned upload URL
   */
  async generateUploadUrl(
    userId: string,
    filename: string,
    contentType: string
  ): Promise<{
    uploadUrl: string;
    key: string;
    publicUrl: string;
  }> {
    // Validate it's an image
    if (!contentType.startsWith("image/")) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Only image files are allowed",
      });
    }

    // Generate presigned URL
    const uploadOptions: UploadOptions = {
      userId,
      category: "recipes",
      isPublic: true,
      generateThumbnail: false,
      optimizeImage: true,
    };

    return await this.r2Service.generatePresignedUploadUrl(
      uploadOptions,
      filename,
      contentType
    );
  }

  /**
   * Generate public URL for a file key
   */
  generatePublicUrl(r2Key: string): string {
    return this.r2Service.getPublicUrl(r2Key);
  }

  private formatFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export const createFileService = (config: FileServiceConfig): FileService => {
  return new FileService(config);
};

// ============================================================================
// SIMPLIFIED DEFAULT CONFIG
// ============================================================================

export const getDefaultFileServiceConfig = (): FileServiceConfig => {
  // Check for required R2 credentials
  const requiredR2Vars = [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
  ];
  const missingVars = requiredR2Vars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required R2 environment variables: ${missingVars.join(", ")}. ` +
        "Please configure your R2 credentials in the environment file to enable file uploads."
    );
  }

  return {
    r2Config: {
      accountId: process.env.R2_ACCOUNT_ID!,
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      bucketName: process.env.R2_BUCKET_NAME!,
      publicUrl: process.env.R2_PUBLIC_URL,
      region: process.env.R2_REGION || "auto",
    },
    maxFileSize: 10 * 1024 * 1024, // 10MB
  };
};
