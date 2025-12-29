import { z } from "zod";

// ============================================================================
// PAGINATION SCHEMA
// ============================================================================

/**
 * Standard pagination input schema
 */
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ============================================================================
// PAGINATION UTILITIES
// ============================================================================

/**
 * Calculates the offset for pagination
 */
export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Pagination metadata result
 */
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

/**
 * Paginated result wrapper
 */
export type PaginatedResult<T> = {
  data: T[];
  pagination: PaginationMeta;
};

/**
 * Creates a paginated result with computed metadata
 *
 * @example
 * ```ts
 * const users = await db.select().from(usersTable).limit(limit).offset(offset);
 * const total = await db.select({ count: count() }).from(usersTable);
 *
 * return paginateResult(users, total[0].count, page, limit);
 * ```
 */
export function paginateResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Extracts pagination helpers from input
 */
export function getPagination(input: PaginationInput): {
  page: number;
  limit: number;
  offset: number;
} {
  const page = input.page || 1;
  const limit = input.limit || 20;

  return {
    page,
    limit,
    offset: getOffset(page, limit),
  };
}
