# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack TypeScript monorepo with Next.js 16 frontend and tRPC v11 backend. Uses pnpm workspaces with Turborepo for build orchestration.

## Commands

```bash
# Development
pnpm dev                              # Run all apps in dev mode
pnpm --filter web dev                 # Run web app only

# Database (PostgreSQL via Docker)
pnpm db:up                            # Start database container
pnpm db:down                          # Stop database
pnpm db:reset                         # Reset database (down + up)
pnpm --filter @repo/api db:generate   # Generate migrations
pnpm --filter @repo/api db:migrate    # Run migrations
pnpm --filter @repo/api db:push       # Push schema directly
pnpm --filter @repo/api db:studio     # Open Drizzle Studio
pnpm db:seed                          # Seed database

# Build & Quality
pnpm build                            # Build all packages
pnpm check-types                      # Type check all packages
pnpm lint                             # Lint all packages
pnpm format                           # Format with Prettier
pnpm format:check                     # Check formatting

# Utilities
pnpm generate-env-types               # Generate TypeScript types from .env
pnpm bump-ui                          # Update shadcn components
```

## Architecture

### Monorepo Structure

```
apps/web/                    # Next.js 16 App Router
├── app/                     # Routes (grouped by (auth), (main), admin)
├── libs/trpc/               # tRPC client setup
├── providers/               # React context providers
└── proxy.ts                 # Auth & locale middleware

packages/
├── api/                     # Backend (tRPC + Drizzle + Better Auth)
│   └── server/
│       ├── trpc/lambda/     # Node.js runtime (DB, files, email)
│       ├── trpc/edge/       # Edge runtime (feature flags, health)
│       ├── routers/         # tRPC route definitions
│       ├── dals/            # Data Access Layer classes
│       ├── db/schema/       # Drizzle table definitions
│       ├── auth/            # Better Auth config & providers
│       └── email/templates/ # React Email templates
├── ui/                      # shadcn component library
├── i18n/                    # Internationalization utilities
├── locales/                 # Translation JSON files
├── env/                     # Environment type generation
├── typescript-config/       # Shared tsconfig
└── eslint-config/           # Shared ESLint configs
```

### Tech Stack

- **Frontend**: Next.js 16, React 19, TanStack Query, Zustand, nuqs
- **Backend**: tRPC v11 (dual runtime), Drizzle ORM, Better Auth
- **Database**: PostgreSQL 16 (Docker, port 5433)
- **Styling**: Tailwind CSS 4, shadcn/ui, next-themes

### tRPC Dual Runtime

**Lambda Runtime** (`trpc/lambda/`): Full Node.js - use for DB operations, file uploads, emails
**Edge Runtime** (`trpc/edge/`): Cloudflare Workers compatible - use for feature flags, health checks

### Procedure Types

- `publicProcedure` - No auth required
- `protectedProcedure` - Requires authenticated user
- `adminProcedure` - Requires admin role

### Adding a Feature

1. **Schema**: `packages/api/server/db/schema/{feature}.ts`
2. **DAL**: `packages/api/server/dals/{feature}.ts` (extend `BaseDAL`)
3. **Router**: `packages/api/server/routers/{feature}.router.ts`
4. **Export**: Add to `packages/api/server/routers/router.ts`

### Client tRPC Usage

```typescript
import { api } from "@/libs/trpc/client";

// Query
const { data } = api.feature.getById.useQuery({ id: "..." });

// Mutation
const mutation = api.feature.create.useMutation();
await mutation.mutateAsync({ ... });
```

### Path Aliases

- `@/*` - apps/web/
- `@repo/*` - packages/\*
- `@ui-components/*` - packages/ui/components

## Conventions

- **Commits**: Conventional commits (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert)
- **TypeScript**: Strict mode enabled
- **Validation**: Zod schemas defined in router files
- **Errors**: Use `TRPCError` with proper codes (NOT_FOUND, UNAUTHORIZED, etc.)

## API Endpoints

- `/api/lambda` - Lambda runtime tRPC
- `/api/edge` - Edge runtime tRPC
- `/api/auth/*` - Better Auth endpoints
- `/api/health` - Health check
