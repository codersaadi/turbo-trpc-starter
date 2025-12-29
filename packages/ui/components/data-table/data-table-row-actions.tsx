"use client";

import type { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  children: React.ReactNode;
}

/**
 * Row actions dropdown menu
 *
 * @example
 * ```tsx
 * <DataTableRowActions row={row}>
 *   <DropdownMenuItem onClick={() => handleEdit(row.original)}>
 *     Edit
 *   </DropdownMenuItem>
 *   <DropdownMenuItem onClick={() => handleDelete(row.original)}>
 *     Delete
 *   </DropdownMenuItem>
 * </DataTableRowActions>
 * ```
 */
export function DataTableRowActions<TData>({
  row,
  children,
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
