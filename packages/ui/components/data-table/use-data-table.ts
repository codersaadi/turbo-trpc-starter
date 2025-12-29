"use client";

import { useCallback, useMemo, useTransition } from "react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import type { DataTableQueryState, DataTableQueryActions } from "./types";

// ============================================================================
// NUQS PARSERS
// ============================================================================

const dataTableParsers = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
  sortBy: parseAsString,
  sortOrder: parseAsString,
  search: parseAsString,
};

// ============================================================================
// HOOK OPTIONS
// ============================================================================

export interface UseDataTableOptions {
  /** Default page size */
  defaultPageSize?: number;

  /** Default sort column */
  defaultSortBy?: string;

  /** Default sort order */
  defaultSortOrder?: "asc" | "desc";

  /** Shallow routing (don't trigger server navigation) */
  shallow?: boolean;

  /** Throttle URL updates (ms) */
  throttleMs?: number;

  /** History mode */
  history?: "push" | "replace";
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Hook for managing DataTable state via nuqs URL search params.
 *
 * @example
 * ```tsx
 * const { queryState, tableState, actions } = useDataTable({
 *   defaultPageSize: 20,
 *   defaultSortBy: "createdAt",
 *   defaultSortOrder: "desc",
 * });
 *
 * // Use queryState for API calls
 * const { data } = api.users.list.useQuery(queryState);
 *
 * // Use tableState for DataTable component
 * <DataTable {...tableState} data={data} columns={columns} />
 * ```
 */
export function useDataTable(options: UseDataTableOptions = {}) {
  const {
    defaultPageSize = 20,
    defaultSortBy,
    defaultSortOrder = "desc",
    shallow = true,
    throttleMs = 100,
    history = "replace",
  } = options;

  const [isPending, startTransition] = useTransition();

  // Parse URL state with nuqs
  const [params, setParams] = useQueryStates(dataTableParsers, {
    shallow,
    throttleMs,
    history,
  });

  // ============================================================================
  // QUERY STATE (for API calls)
  // ============================================================================

  const queryState: DataTableQueryState = useMemo(
    () => ({
      page: params.page ?? 1,
      limit: params.limit ?? defaultPageSize,
      sortBy: params.sortBy ?? defaultSortBy,
      sortOrder: (params.sortOrder as "asc" | "desc") ?? defaultSortOrder,
      search: params.search ?? undefined,
    }),
    [params, defaultPageSize, defaultSortBy, defaultSortOrder],
  );

  // ============================================================================
  // TANSTACK TABLE STATE
  // ============================================================================

  // Pagination state for TanStack Table
  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: (params.page ?? 1) - 1, // TanStack uses 0-indexed
      pageSize: params.limit ?? defaultPageSize,
    }),
    [params.page, params.limit, defaultPageSize],
  );

  // Sorting state for TanStack Table
  const sorting: SortingState = useMemo(() => {
    const sortBy = params.sortBy ?? defaultSortBy;
    if (!sortBy) return [];
    return [
      {
        id: sortBy,
        desc: (params.sortOrder ?? defaultSortOrder) === "desc",
      },
    ];
  }, [params.sortBy, params.sortOrder, defaultSortBy, defaultSortOrder]);

  // Global filter (search)
  const globalFilter = params.search ?? "";

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const setPage = useCallback(
    (page: number) => {
      startTransition(() => {
        setParams({ page });
      });
    },
    [setParams],
  );

  const setLimit = useCallback(
    (limit: number) => {
      startTransition(() => {
        setParams({ limit, page: 1 }); // Reset to page 1 when changing limit
      });
    },
    [setParams],
  );

  const setSort = useCallback(
    (sortBy: string | null, sortOrder?: "asc" | "desc") => {
      startTransition(() => {
        setParams({
          sortBy,
          sortOrder: sortOrder ?? "desc",
          page: 1, // Reset to page 1 when changing sort
        });
      });
    },
    [setParams],
  );

  const setSearch = useCallback(
    (search: string | null) => {
      startTransition(() => {
        setParams({
          search: search || null,
          page: 1, // Reset to page 1 when searching
        });
      });
    },
    [setParams],
  );

  const resetFilters = useCallback(() => {
    startTransition(() => {
      setParams({
        page: 1,
        limit: defaultPageSize,
        sortBy: defaultSortBy ?? null,
        sortOrder: defaultSortOrder,
        search: null,
      });
    });
  }, [setParams, defaultPageSize, defaultSortBy, defaultSortOrder]);

  // TanStack Table compatible change handlers
  const onPaginationChange = useCallback(
    (
      updater: PaginationState | ((old: PaginationState) => PaginationState),
    ) => {
      const newValue =
        typeof updater === "function" ? updater(pagination) : updater;
      startTransition(() => {
        setParams({
          page: newValue.pageIndex + 1, // Convert back to 1-indexed
          limit: newValue.pageSize,
        });
      });
    },
    [pagination, setParams],
  );

  const onSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const newValue =
        typeof updater === "function" ? updater(sorting) : updater;
      startTransition(() => {
        if (newValue.length === 0) {
          setParams({ sortBy: null, sortOrder: null });
        } else {
          const firstSort = newValue[0];
          if (firstSort) {
            setParams({
              sortBy: firstSort.id,
              sortOrder: firstSort.desc ? "desc" : "asc",
            });
          }
        }
      });
    },
    [sorting, setParams],
  );

  const onGlobalFilterChange = useCallback(
    (value: string) => {
      setSearch(value || null);
    },
    [setSearch],
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  const actions: DataTableQueryActions = {
    setPage,
    setLimit,
    setSort,
    setSearch,
    setFilter: () => {}, // TODO: Implement per-column filters
    resetFilters,
  };

  return {
    /** Query state for API calls */
    queryState,

    /** Actions to update state */
    actions,

    /** Whether a transition is pending */
    isPending,

    /** TanStack Table state props */
    tableState: {
      pagination,
      sorting,
      globalFilter,
      onPaginationChange,
      onSortingChange,
      onGlobalFilterChange,
    },
  };
}

export type UseDataTableReturn = ReturnType<typeof useDataTable>;
