/**
 * Query Builder Utilities
 *
 * Provides a flexible, type-safe filter builder for Drizzle ORM.
 *
 * @example
 * ```ts
 * import { createFilterBuilder, paginateResult, getPagination } from './query-builder';
 *
 * const userFilters = createFilterBuilder({
 *   table: users,
 *   fields: {
 *     role: { column: 'role', operators: ['eq'], type: 'enum', enumValues: ['user', 'admin'] },
 *     isActive: { column: 'isActive', operators: ['eq'], type: 'boolean' },
 *   },
 *   searchFields: ['name', 'email'],
 *   defaultSort: { field: 'createdAt', order: 'desc' },
 * });
 *
 * // In router:
 * .input(userFilters.querySchema)
 * .query(async ({ ctx, input }) => {
 *   const where = userFilters.buildWhere(input);
 *   const orderBy = userFilters.buildOrderBy(input);
 *   const { offset, limit, page } = getPagination(input);
 *
 *   const [data, totalResult] = await Promise.all([
 *     ctx.db.select().from(users).where(where).orderBy(orderBy).limit(limit).offset(offset),
 *     ctx.db.select({ count: count() }).from(users).where(where),
 *   ]);
 *
 *   return paginateResult(data, totalResult[0].count, page, limit);
 * });
 * ```
 */

// Filter Builder
export {
  createFilterBuilder,
  buildWhereClause,
  buildOrderBy,
  createQuerySchema,
  FilterOperators,
  type FilterBuilder,
  type FilterConfig,
  type FilterFieldDef,
  type FilterFieldType,
  type FilterOperator,
  type FilterInput,
  type QueryInput,
} from "./filter-builder";

// Pagination
export {
  paginationSchema,
  paginateResult,
  getPagination,
  getOffset,
  type PaginationInput,
  type PaginationMeta,
  type PaginatedResult,
} from "./pagination";
