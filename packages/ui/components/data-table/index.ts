/**
 * DataTable - A powerful, reusable table component
 *
 * Built with TanStack Table + nuqs for server-side URL state management.
 *
 * @example
 * ```tsx
 * "use client"
 * import { DataTable, useDataTable, DataTableColumnHeader } from "@repo/ui/components/data-table";
 * import type { ColumnDef } from "@repo/ui/components/data-table";
 *
 * const columns: ColumnDef<User>[] = [
 *   {
 *     accessorKey: "name",
 *     header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
 *   },
 *   // ...more columns
 * ];
 *
 * export function UsersTable({ data, pageCount }) {
 *   const { queryState, tableState } = useDataTable({
 *     defaultPageSize: 20,
 *     defaultSortBy: "createdAt",
 *   });
 *
 *   return (
 *     <DataTable
 *       columns={columns}
 *       data={data}
 *       pageCount={pageCount}
 *       {...tableState}
 *     />
 *   );
 * }
 * ```
 */

// Core component
export { DataTable } from "./data-table";

// Sub-components
export { DataTableColumnHeader } from "./data-table-column-header";
export { DataTablePagination } from "./data-table-pagination";
export { DataTableToolbar } from "./data-table-toolbar";
export { DataTableViewOptions } from "./data-table-view-options";
export { DataTableRowActions } from "./data-table-row-actions";

// Hook
export {
  useDataTable,
  type UseDataTableOptions,
  type UseDataTableReturn,
} from "./use-data-table";

// Types
export type {
  DataTableProps,
  DataTableQueryState,
  DataTableQueryActions,
  DataTableColumnHeaderProps,
  DataTablePaginationProps,
  DataTableToolbarProps,
  DataTableViewOptionsProps,
  DataTableRowActionsProps,
  PaginationMeta,
  PaginatedResponse,
  ColumnDef,
  Row,
  Table,
} from "./types";
