"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import type { DataTableProps } from "./types";

// ============================================================================
// MAIN DATA TABLE COMPONENT
// ============================================================================

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  pageCount,
  rowCount,
  isLoading = false,
  emptyMessage = "No results found.",

  // Pagination
  pagination,
  onPaginationChange,
  enablePagination = true,
  pageSizeOptions = [10, 20, 50, 100],

  // Sorting
  sorting,
  onSortingChange,
  enableSorting = true,
  enableMultiSort = false,

  // Filtering
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  enableColumnFilters = true,

  // Selection
  rowSelection,
  onRowSelectionChange,
  enableRowSelection = false,
  enableMultiRowSelection = true,

  // Column Visibility
  columnVisibility,
  onColumnVisibilityChange,
  enableColumnVisibility = true,

  // Appearance
  showToolbar = true,
  showPagination = true,
  className,
  getRowId,
  searchPlaceholder,
  toolbarContent,
  toolbarPosition = "top",
}: DataTableProps<TData, TValue>) {
  // Internal state for uncontrolled mode
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: pageSizeOptions[1] ?? 20,
    });
  const [internalSorting, setInternalSorting] = React.useState<SortingState>(
    [],
  );
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [internalVisibility, setInternalVisibility] =
    React.useState<VisibilityState>({});
  const [internalRowSelection, setInternalRowSelection] =
    React.useState<RowSelectionState>({});
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState("");

  // Use controlled state if provided, otherwise use internal state
  const paginationState = pagination ?? internalPagination;
  const sortingState = sorting ?? internalSorting;
  const columnFiltersState = columnFilters ?? internalColumnFilters;
  const visibilityState = columnVisibility ?? internalVisibility;
  const rowSelectionState = rowSelection ?? internalRowSelection;
  const globalFilterState = globalFilter ?? internalGlobalFilter;

  // Determine if server-side
  const isServerSide = pageCount !== undefined;

  const table = useReactTable({
    data,
    columns: columns as ColumnDef<TData, unknown>[],
    pageCount: isServerSide ? pageCount : undefined,
    rowCount: rowCount,

    // State
    state: {
      pagination: paginationState,
      sorting: sortingState,
      columnFilters: columnFiltersState,
      columnVisibility: visibilityState,
      rowSelection: rowSelectionState,
      globalFilter: globalFilterState,
    },

    // Change handlers
    onPaginationChange: onPaginationChange ?? setInternalPagination,
    onSortingChange: onSortingChange ?? setInternalSorting,
    onColumnFiltersChange: onColumnFiltersChange ?? setInternalColumnFilters,
    onColumnVisibilityChange: onColumnVisibilityChange ?? setInternalVisibility,
    onRowSelectionChange: onRowSelectionChange ?? setInternalRowSelection,
    onGlobalFilterChange: onGlobalFilterChange ?? setInternalGlobalFilter,

    // Features
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
    getSortedRowModel: isServerSide ? undefined : getSortedRowModel(),
    getFilteredRowModel: isServerSide ? undefined : getFilteredRowModel(),

    // Options
    manualPagination: isServerSide,
    manualSorting: isServerSide,
    manualFiltering: isServerSide,
    enableSorting,
    enableMultiSort,
    enableColumnFilters,
    enableRowSelection,
    enableMultiRowSelection,
    getRowId,
  });

  const showTopToolbar =
    showToolbar && (toolbarPosition === "top" || toolbarPosition === "both");
  const showBottomToolbar = showToolbar && toolbarPosition === "both";

  return (
    <div className={cn("space-y-4", className)}>
      {/* Top Toolbar */}
      {showTopToolbar && (
        <DataTableToolbar
          table={table}
          searchPlaceholder={searchPlaceholder}
          showSearch={!!onGlobalFilterChange || globalFilter !== undefined}
          showColumnVisibility={enableColumnVisibility}
        >
          {toolbarContent}
        </DataTableToolbar>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border/50 shadow-sm overflow-hidden bg-background">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-border/50"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70"
                    style={{
                      width:
                        header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton rows
              Array.from({ length: paginationState.pageSize }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="border-border/50">
                  {columns.map((_, j) => (
                    <TableCell key={`skeleton-${i}-${j}`} className="py-3">
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground border-border/50"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/30 border-border/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom Toolbar */}
      {showBottomToolbar && (
        <DataTableToolbar
          table={table}
          searchPlaceholder={searchPlaceholder}
          showSearch={false}
          showColumnVisibility={false}
        />
      )}

      {/* Pagination */}
      {showPagination && enablePagination && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          showRowCount={!!enableRowSelection}
        />
      )}
    </div>
  );
}
