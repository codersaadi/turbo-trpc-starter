
import { SQL, sql } from 'drizzle-orm';
import { getServerDB } from '../db/server';
import { DBTransaction, PaginatedResult, PaginationParams } from '../db';

export abstract class BaseDAL {
  public db = getServerDB();

  protected buildPagination<T>(
    page: number = 1,
    limit: number = 20,
    total: number
  ): PaginatedResult<T>['pagination'] {
    const pages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages: pages, // Add alias for consistency
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    };
  }

  protected getPaginationOffset(page: number = 1, limit: number = 20): number {
    return (page - 1) * limit;
  }

  protected validatePagination(params: PaginationParams): {
    page: number;
    limit: number;
  } {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    return { page, limit };
  }

  protected async executeInTransaction<T>(
    callback: (tx: DBTransaction) => Promise<T>
  ): Promise<T> {
    return await this.db.transaction(tx => callback(tx));
  }

  protected buildSearchFilter(
    searchTerm?: string,
    columns: SQL[] = []
  ): SQL | undefined {
    if (!searchTerm?.trim() || columns.length === 0) return undefined;

    const term = `%${searchTerm.toLowerCase().trim()}%`;
    const conditions = columns.map(col => sql`lower(${col}) like ${term}`);

    return sql`(${sql.join(conditions, sql` or `)})`;
  }

  protected buildDateRangeFilter(
    column: SQL,
    dateRange?: { from?: Date; to?: Date }
  ): SQL | undefined {
    if (!dateRange?.from && !dateRange?.to) return undefined;

    const conditions: SQL[] = [];
    if (dateRange.from) conditions.push(sql`${column} >= ${dateRange.from}`);
    if (dateRange.to) conditions.push(sql`${column} <= ${dateRange.to}`);

    return conditions.length > 0
      ? sql`(${sql.join(conditions, sql` and `)})`
      : undefined;
  }
}
