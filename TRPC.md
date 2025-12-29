# tRPC v11 Docs - AI Reference

**Purpose**: Concise AI-focused documentation for tRPC v11 setup and development workflow

---

## Architecture Overview

```
packages/api/server/
├── db/schema/          # Drizzle schemas
├── dals/              # Data Access Layer
├── routers/           # tRPC routers
│   ├── edge/         # Edge runtime routers
│   └── *.router.ts   # Lambda routers
├── services/         # Business logic
├── trpc/
│   ├── edge/        # Edge runtime context & tRPC init
│   └── lambda/      # Lambda context & tRPC init
└── email/
    └── templates/   # Email templates
```

---

## Development Workflow

**Standard pattern for adding features:**

1. **Schema** → Define table in `db/schema/*.ts`
2. **DAL** → Create data access layer in `dals/*.ts`
3. **Zod Schemas** → Define validation schemas in router file
4. **Service** (optional) → Business logic in `services/*.service.ts`
5. **Router** → Create router with procedures
6. **Export** → Add to `routers/router.ts`

---

## tRPC Setup

### Lambda Runtime (Node.js APIs)

**Location**: `packages/api/server/trpc/lambda/`

**Init**: [trpc.ts](file:///home/saadi/y/packages/api/server/trpc/lambda/trpc.ts)

```typescript
import { initTRPC } from "@trpc/server";
const t = initTRPC.context<Context>().create({ transformer });

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
export const adminProcedure = protectedProcedure.use(enforceUserIsAdmin);
```

**Use for**: Database operations, file uploads, email sending, Node.js utils

### Edge Runtime (Cloudflare Workers/Edge)

**Location**: `packages/api/server/trpc/edge/`

**Init**: [trpc.ts](file:///home/saadi/y/packages/api/server/trpc/edge/trpc.ts)

```typescript
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
```

**Use for**: Lightweight operations, feature flags, system checks (no DB/Node utils)

---

## Creating Routers

### Example: Files Router

[files.router.ts](file:///home/saadi/y/packages/api/server/routers/files.router.ts)

```typescript
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc/lambda";
import { FileDAL } from "../dals/files";

// 1. Zod Schemas
const uploadSchema = z.object({
  base64: z.string().min(1),
  filename: z.string().min(1),
  contentType: z.string().min(1),
});

// 2. Router
export const fileRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(uploadSchema)
    .mutation(async ({ input, ctx }) => {
      const fileDAL = new FileDAL();
      // Business logic here
      return fileDAL.createFile(data);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const fileDAL = new FileDAL();
      return fileDAL.getFileById(input.id);
    }),
});
```

### Export Router

[router.ts](file:///home/saadi/y/packages/api/server/routers/router.ts)

```typescript
export const appRouter = createTRPCRouter({
  auth: authRouter,
  file: fileRouter,
  admin: adminRouter,
  edge: edgeRouter,
});

export type AppRouter = typeof appRouter;
```

---

## Data Access Layer (DAL)

**Base DAL**: [base.ts](file:///home/saadi/y/packages/api/server/dals/base.ts)

**Example**: [files.ts](file:///home/saadi/y/packages/api/server/dals/files.ts)

```typescript
import { BaseDAL } from "./base";
import { files, type FileInsert, type FileRecord } from "../db/schema";

export class FileDAL extends BaseDAL {
  async createFile(data: FileInsert): Promise<FileRecord> {
    const [file] = await this.db.insert(files).values(data).returning();
    return file;
  }

  async getFileById(id: string): Promise<FileRecord | null> {
    const [file] = await this.db.select().from(files).where(eq(files.id, id));
    return file || null;
  }

  async deleteFile(id: string): Promise<void> {
    await this.db.delete(files).where(eq(files.id, id));
  }
}
```

---

## Database Schema Pattern

[schema/files.ts](file:///home/saadi/y/packages/api/server/db/schema/files.ts)

```typescript
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  r2Key: text("r2_key").notNull().unique(),
  originalFilename: varchar("original_filename", { length: 512 }).notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type FileRecord = typeof files.$inferSelect;
export type FileInsert = typeof files.$inferInsert;
```

---

## Environment Variables

**Auto-generated types**: [env.d.ts](file:///home/saadi/y/packages/env/env.d.ts)

- Add env var anywhere in codebase
- Run: `pnpm --filter @repo/env generate-env-types`
- TypeScript auto-completion for `process.env.*`
- No manual `.d.ts` editing needed

---

## Feature Flags

**Implementation**: [use-feature-flags.ts](file:///home/saadi/y/apps/web/libs/feature-flags/use-feature-flags.ts)

**Client Usage**:

```typescript
import { useFeatureFlag, useFeatureFlagsSync } from "@/libs/feature-flags";

function App() {
  useFeatureFlagsSync(); // Sync from server
  const isDarkMode = useFeatureFlag("enableDarkMode");
}
```

**Edge Router**: [edge/feature-flags.router.ts](file:///home/saadi/y/packages/api/server/routers/edge/feature-flags.router.ts)

Uses edge runtime for low latency, no DB queries

---

## Email Templates

**Location**: `packages/api/server/email/templates/`

**Send Email**: [send.ts](file:///home/saadi/y/packages/api/server/email/send.ts)

```typescript
import { sendEmail } from "../email/send";

await sendEmail({
  to: user.email,
  subject: "Welcome",
  template: "welcome",
  data: { name: user.name },
});
```

---

## Procedure Types

| Procedure            | Auth  | Use Case                   |
| -------------------- | ----- | -------------------------- |
| `publicProcedure`    | No    | Login, signup, public data |
| `protectedProcedure` | User  | User-specific operations   |
| `adminProcedure`     | Admin | Admin operations           |

---

## Client Usage

### Lambda Router (React Query)

```typescript
import { api } from "@/libs/trpc/client";

// Query
const { data } = api.file.getById.useQuery({ id: "..." });

// Mutation
const upload = api.file.upload.useMutation();
await upload.mutateAsync({ base64, filename, contentType });
```

### Edge Router

```typescript
import { useEdgeTRPC } from "@/libs/trpc/edge-utils";

const edgeTRPC = useEdgeTRPC();
const { data } = useQuery(edgeTRPC.featureFlags.getAll.queryOptions());
```

---

## Best Practices

✅ **DRY**: Reuse schemas, DALs, services  
✅ **Type Safety**: Use Zod for runtime validation + TS types  
✅ **Error Handling**: Use `TRPCError` with proper codes  
✅ **Separation**: Business logic in services, data access in DALs  
✅ **Edge**: Use edge router for non-DB/non-Node operations  
✅ **Security**: Check ownership in protected procedures

---

## Quick Reference

### Add Feature Endpoint

1. Define schema: `db/schema/{feature}.ts`
2. Create DAL: `dals/{feature}.ts` (extends BaseDAL)
3. Create router: `routers/{feature}.router.ts`
   - Import Zod, tRPC, DAL
   - Define validation schemas
   - Create procedures
4. Export: Add to `routers/router.ts`

### Edge vs Lambda

**Edge**: Feature flags, system health, simple queries  
**Lambda**: File uploads, emails, DB operations, complex logic

---

## Type Safety

```typescript
// Server inferring types from Zod
const schema = z.object({ id: z.string() });
type Input = z.infer<typeof schema>; // { id: string }

// Client getting full type safety
const { data } = api.file.getById.useQuery({ id: "123" });
// data is FileRecord | undefined (auto-inferred from router)
```

---

**Focus**: DX-first, type-safe, DRY, best practices
