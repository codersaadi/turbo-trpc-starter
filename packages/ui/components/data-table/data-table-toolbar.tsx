"use client";

import type { Table } from "@tanstack/react-table";
import { Search, X } from "lucide-react";

import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showColumnVisibility?: boolean;
  children?: React.ReactNode;
}

/**
 * Toolbar with search, filters, and column visibility toggle
 */
export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search...",
  showSearch = true,
  showColumnVisibility = true,
  children,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().globalFilter?.length > 0;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        {/* Global Search */}
        {showSearch && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={(table.getState().globalFilter as string) ?? ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="pl-8 h-9 w-full lg:w-62.5 bg-background border-border/50 focus-visible:ring-primary/20"
            />
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => table.setGlobalFilter("")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        )}

        {/* Custom filter content */}
        {children}

        {/* Reset filters button */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetGlobalFilter()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Column visibility toggle */}
      {showColumnVisibility && <DataTableViewOptions table={table} />}
    </div>
  );
}
