import { z } from "zod";
import {
  SQL,
  and,
  or,
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  like,
  ilike,
  inArray,
  isNull,
  isNotNull,
  desc,
  asc,
  type AnyColumn,
} from "drizzle-orm";
import type { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Supported filter operators
 */
export const FilterOperators = [
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "like",
  "ilike",
  "in",
  "isNull",
  "isNotNull",
] as const;

export type FilterOperator = (typeof FilterOperators)[number];

/**
 * Field types that determine Zod schema generation
 */
export type FilterFieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "uuid"
  | "enum";

/**
 * Definition of a single filterable field
 */
export type FilterFieldDef<TColumnName extends string = string> = {
  /** The column name in the table */
  column: TColumnName;
  /** Allowed operators for this field */
  operators: readonly FilterOperator[];
  /** Field type for Zod schema generation */
  type: FilterFieldType;
  /** Enum values if type is 'enum' */
  enumValues?: readonly string[];
  /** Custom label for documentation */
  label?: string;
};

/**
 * Configuration for the filter builder
 */
export type FilterConfig<
  TTable extends PgTableWithColumns<TableConfig>,
  TColumnName extends string = string,
> = {
  /** Table to filter on */
  table: TTable;
  /** Filterable fields */
  fields: Record<string, FilterFieldDef<TColumnName>>;
  /** Fields to search across (for full-text search) */
  searchFields?: TColumnName[];
  /** Default sort configuration */
  defaultSort?: {
    field: TColumnName;
    order: "asc" | "desc";
  };
  /** Sortable fields (defaults to all fields) */
  sortableFields?: TColumnName[];
  /** Base conditions to always apply (e.g., soft delete filter) */
  baseConditions?: (table: TTable) => SQL | undefined;
};

/**
 * Filter input for a single field
 */
export type FilterInput = {
  operator: FilterOperator;
  value: unknown;
};

/**
 * Complete filter input including filters, search, sort, and pagination
 */
export type QueryInput = {
  filters?: Record<string, FilterInput>;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

// ============================================================================
// ZOD SCHEMA BUILDERS
// ============================================================================

/**
 * Creates a Zod schema for a filter value based on field type
 */
function createValueSchema(
  fieldDef: FilterFieldDef,
  operator: FilterOperator,
): z.ZodTypeAny {
  // isNull/isNotNull don't need a value
  if (operator === "isNull" || operator === "isNotNull") {
    return z.boolean().optional();
  }

  // 'in' operator uses arrays
  if (operator === "in") {
    switch (fieldDef.type) {
      case "string":
      case "uuid":
        return z.array(z.string());
      case "number":
        return z.array(z.number());
      case "enum":
        return fieldDef.enumValues
          ? z.array(z.enum(fieldDef.enumValues as [string, ...string[]]))
          : z.array(z.string());
      default:
        return z.array(z.string());
    }
  }

  // Standard value schemas
  switch (fieldDef.type) {
    case "string":
      return z.string();
    case "number":
      return z.number();
    case "boolean":
      return z.boolean();
    case "date":
      return z.coerce.date();
    case "uuid":
      return z.string().uuid();
    case "enum":
      return fieldDef.enumValues
        ? z.enum(fieldDef.enumValues as [string, ...string[]])
        : z.string();
    default:
      return z.string();
  }
}

/**
 * Creates the filter input Zod schema from field definitions
 */
function createFilterSchema(
  fields: Record<string, FilterFieldDef>,
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [fieldName, fieldDef] of Object.entries(fields)) {
    const operatorSchemas: Record<string, z.ZodTypeAny> = {};

    for (const op of fieldDef.operators) {
      operatorSchemas[op] = createValueSchema(fieldDef, op).optional();
    }

    // Each field can have operators as keys
    shape[fieldName] = z.object(operatorSchemas).optional();
  }

  return z.object(shape);
}

/**
 * Creates the complete query input schema
 */
export function createQuerySchema<
  TTable extends PgTableWithColumns<TableConfig>,
>(
  config: FilterConfig<TTable, string>,
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const sortableFields = config.sortableFields || Object.keys(config.fields);
  const defaultSortField =
    config.defaultSort?.field ?? sortableFields[0] ?? "id";
  const defaultSortOrder = config.defaultSort?.order ?? "desc";

  return z.object({
    // Filters object
    filters: createFilterSchema(config.fields).optional(),

    // Search query
    search: z.string().optional(),

    // Sorting
    sortBy: z
      .enum(sortableFields as [string, ...string[]])
      .default(defaultSortField),
    sortOrder: z.enum(["asc", "desc"]).default(defaultSortOrder),

    // Pagination
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
  }) as z.ZodObject<Record<string, z.ZodTypeAny>>;
}

// ============================================================================
// SQL BUILDERS
// ============================================================================

/**
 * Applies a filter operator to a column
 */
function applyOperator(
  column: AnyColumn,
  operator: FilterOperator,
  value: unknown,
): SQL | undefined {
  switch (operator) {
    case "eq":
      return eq(column, value);
    case "neq":
      return ne(column, value);
    case "gt":
      return gt(column, value);
    case "gte":
      return gte(column, value);
    case "lt":
      return lt(column, value);
    case "lte":
      return lte(column, value);
    case "like":
      return like(column, `%${value}%`);
    case "ilike":
      return ilike(column, `%${value}%`);
    case "in":
      return Array.isArray(value) && value.length > 0
        ? inArray(column, value)
        : undefined;
    case "isNull":
      return value === true ? isNull(column) : isNotNull(column);
    case "isNotNull":
      return value === true ? isNotNull(column) : isNull(column);
    default:
      return undefined;
  }
}

/**
 * Builds the WHERE clause from filter input
 */
export function buildWhereClause<
  TTable extends PgTableWithColumns<TableConfig>,
>(config: FilterConfig<TTable, string>, input: QueryInput): SQL | undefined {
  const conditions: (SQL | undefined)[] = [];

  // Add base conditions (e.g., soft delete filter)
  if (config.baseConditions) {
    const baseCondition = config.baseConditions(config.table);
    if (baseCondition) {
      conditions.push(baseCondition);
    }
  }

  // Process filters
  if (input.filters) {
    for (const [fieldName, operators] of Object.entries(input.filters)) {
      if (!operators) continue;

      const fieldDef = config.fields[fieldName];
      if (!fieldDef) continue;

      const column = config.table[fieldDef.column as keyof TTable] as AnyColumn;
      if (!column) continue;

      for (const [op, value] of Object.entries(operators)) {
        if (value === undefined) continue;

        const condition = applyOperator(column, op as FilterOperator, value);
        if (condition) {
          conditions.push(condition);
        }
      }
    }
  }

  // Process search
  if (input.search && config.searchFields && config.searchFields.length > 0) {
    const searchConditions = config.searchFields.map((fieldName) => {
      const column = config.table[fieldName as keyof TTable] as AnyColumn;
      return ilike(column, `%${input.search}%`);
    });

    if (searchConditions.length > 0) {
      conditions.push(or(...searchConditions));
    }
  }

  // Combine all conditions with AND
  const validConditions = conditions.filter((c): c is SQL => c !== undefined);

  return validConditions.length > 0 ? and(...validConditions) : undefined;
}

/**
 * Builds the ORDER BY clause from sort input
 */
export function buildOrderBy<TTable extends PgTableWithColumns<TableConfig>>(
  config: FilterConfig<TTable, string>,
  input: QueryInput,
): SQL | undefined {
  const sortField =
    input.sortBy ?? config.defaultSort?.field ?? Object.keys(config.fields)[0];
  const sortOrder = input.sortOrder ?? config.defaultSort?.order ?? "desc";

  // Handle case where sortField is undefined
  if (!sortField) return undefined;

  // Get the column from field definition or direct field name
  const fieldDef = config.fields[sortField];
  const columnName = fieldDef?.column ?? sortField;
  const column = config.table[columnName as keyof TTable] as AnyColumn;

  if (!column) return undefined;

  return sortOrder === "desc" ? desc(column) : asc(column);
}

// ============================================================================
// FILTER BUILDER FACTORY
// ============================================================================

/**
 * Result type for the filter builder
 */
export type FilterBuilder<TTable extends PgTableWithColumns<TableConfig>> = {
  /** The filter configuration */
  config: FilterConfig<TTable, string>;

  /** Zod schema for query input validation */
  querySchema: z.ZodObject<Record<string, z.ZodTypeAny>>;

  /** Build WHERE clause from input */
  buildWhere: (input: QueryInput) => SQL | undefined;

  /** Build ORDER BY clause from input */
  buildOrderBy: (input: QueryInput) => SQL | undefined;

  /** Get pagination helpers */
  getPagination: (input: QueryInput) => {
    page: number;
    limit: number;
    offset: number;
  };
};

/**
 * Creates a filter builder for a table
 *
 * @example
 * ```ts
 * const userFilters = createFilterBuilder({
 *   table: users,
 *   fields: {
 *     role: { column: 'role', operators: ['eq'], type: 'enum', enumValues: ['user', 'admin'] },
 *     isActive: { column: 'isActive', operators: ['eq'], type: 'boolean' },
 *   },
 *   searchFields: ['name', 'email'],
 *   defaultSort: { field: 'createdAt', order: 'desc' },
 *   baseConditions: (t) => isNull(t.deletedAt),
 * });
 *
 * // In router:
 * .input(userFilters.querySchema)
 * .query(async ({ ctx, input }) => {
 *   const where = userFilters.buildWhere(input);
 *   const orderBy = userFilters.buildOrderBy(input);
 *   const { offset, limit } = userFilters.getPagination(input);
 *   // ...
 * });
 * ```
 */
export function createFilterBuilder<
  TTable extends PgTableWithColumns<TableConfig>,
>(config: FilterConfig<TTable, string>): FilterBuilder<TTable> {
  const querySchema = createQuerySchema(config);

  return {
    config,
    querySchema,

    buildWhere: (input: QueryInput) => buildWhereClause(config, input),

    buildOrderBy: (input: QueryInput) => buildOrderBy(config, input),

    getPagination: (input: QueryInput) => {
      const page = input.page || 1;
      const limit = input.limit || 20;
      return {
        page,
        limit,
        offset: (page - 1) * limit,
      };
    },
  };
}
