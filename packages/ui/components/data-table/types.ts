import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  OnChangeFn,
  Row,
  Table,
} from "@tanstack/react-table";

// ============================================================================
// QUERY STATE TYPES (for nuqs integration)
// ============================================================================

/**
 * URL search params state for server-side tables
 */
export interface DataTableQueryState {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  filters?: Record<string, string | string[]>;
}

/**
 * Setters for query state
 */
export interface DataTableQueryActions {
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSort: (sortBy: string | null, sortOrder?: "asc" | "desc") => void;
  setSearch: (search: string | null) => void;
  setFilter: (key: string, value: string | string[] | null) => void;
  resetFilters: () => void;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

/**
 * Main DataTable component props
 */
export interface DataTableProps<TData, TValue = unknown> {
  /** Column definitions */
  columns: ColumnDef<TData, TValue>[];

  /** Table data */
  data: TData[];

  /** Total page count for server-side pagination */
  pageCount?: number;

  /** Total row count */
  rowCount?: number;

  /** Loading state */
  isLoading?: boolean;

  /** Empty state message */
  emptyMessage?: string;

  // === Pagination ===

  /** Controlled pagination state */
  pagination?: PaginationState;

  /** Pagination change handler */
  onPaginationChange?: OnChangeFn<PaginationState>;

  /** Enable pagination (default: true) */
  enablePagination?: boolean;

  /** Page size options */
  pageSizeOptions?: number[];

  // === Sorting ===

  /** Controlled sorting state */
  sorting?: SortingState;

  /** Sorting change handler */
  onSortingChange?: OnChangeFn<SortingState>;

  /** Enable sorting (default: true) */
  enableSorting?: boolean;

  /** Enable multi-column sorting */
  enableMultiSort?: boolean;

  // === Filtering ===

  /** Controlled column filters state */
  columnFilters?: ColumnFiltersState;

  /** Column filters change handler */
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;

  /** Global filter value */
  globalFilter?: string;

  /** Global filter change handler - accepts direct value or updater function */
  onGlobalFilterChange?: OnChangeFn<string> | ((value: string) => void);

  /** Enable column filters */
  enableColumnFilters?: boolean;

  // === Selection ===

  /** Controlled row selection state */
  rowSelection?: RowSelectionState;

  /** Row selection change handler */
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;

  /** Enable row selection */
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);

  /** Enable multi-row selection */
  enableMultiRowSelection?: boolean;

  // === Column Visibility ===

  /** Controlled column visibility state */
  columnVisibility?: VisibilityState;

  /** Column visibility change handler */
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;

  /** Enable column visibility toggle */
  enableColumnVisibility?: boolean;

  // === Appearance ===

  /** Show toolbar (search + filters) */
  showToolbar?: boolean;

  /** Show pagination controls */
  showPagination?: boolean;

  /** Table container className */
  className?: string;

  /** Get row id for selection */
  getRowId?: (row: TData, index: number) => string;

  // === Toolbar customization ===

  /** Search placeholder */
  searchPlaceholder?: string;

  /** Custom toolbar content */
  toolbarContent?: React.ReactNode;

  /** Toolbar position */
  toolbarPosition?: "top" | "bottom" | "both";
}

/**
 * Column header props for sortable headers
 */
export interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: import("@tanstack/react-table").Column<TData, TValue>;
  title: string;
}

/**
 * Pagination props
 */
export interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  showRowCount?: boolean;
  showPageInfo?: boolean;
}

/**
 * Toolbar props
 */
export interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showColumnVisibility?: boolean;
  children?: React.ReactNode;
}

/**
 * View options (column visibility dropdown) props
 */
export interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

/**
 * Row actions dropdown props
 */
export interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  children: React.ReactNode;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Create typed column helper
 */
export type { ColumnDef, Row, Table };

/**
 * Server-side pagination metadata (matches our filter-builder output)
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response shape
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
