import {
  bigint,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  boolean,
  json,
  pgEnum,
} from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";
import { users } from ".";

// File type/category enumeration
export const fileTypeEnum = pgEnum("file_type", [
  "license",
  "attachment",
  "avatar",
  "general",
]);

// Simplified file storage for recipe images
export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // R2 Storage Information
    r2Key: text("r2_key").notNull().unique(), // The key used in R2

    // Basic file metadata
    originalFilename: varchar("original_filename", { length: 512 }).notNull(),
    fileSize: bigint("file_size", { mode: "number" }).notNull(), // bytes
    contentType: varchar("content_type", { length: 255 }),

    // File categorization
    fileType: fileTypeEnum("file_type").notNull().default("general"),

    // Public URL for direct access
    publicUrl: text("public_url").notNull(),

    // Ownership
    uploadedBy: text("uploaded_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // Essential indexes only
    index("files_r2_key_idx").on(t.r2Key),
    index("files_uploaded_by_idx").on(t.uploadedBy),
    index("files_created_at_idx").on(t.createdAt),
  ]
);

// ============================================================================
// SIMPLIFIED TYPES
// ============================================================================

export type FileRecord = typeof files.$inferSelect;
export type FileInsert = typeof files.$inferInsert;
