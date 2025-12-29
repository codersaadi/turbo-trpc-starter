"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../../../libs/trpc/trpc-utils";
import { AdminHeader } from "../../../components/admin/admin-header";
import {
  DataTable,
  DataTableColumnHeader,
  useDataTable,
} from "@repo/ui/components/data-table";
import type { ColumnDef } from "@repo/ui/components/data-table";
import { StatsCard } from "../../../components/admin/stats-card";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { toast } from "@repo/ui/components/ui/sonner";
import {
  FolderOpen,
  HardDrive,
  FileIcon,
  Trash2,
  Image,
  File,
} from "lucide-react";

type FileRecord = {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string | null;
  contentType: string | null;
  r2Key: string | null;
  uploaderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  uploaderName: string | null;
  uploaderEmail: string | null;
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(contentType: string | null) {
  if (contentType?.startsWith("image/")) {
    return <Image className="h-4 w-4 text-blue-500" />;
  }
  return <File className="h-4 w-4 text-gray-500" />;
}

export default function FilesPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Type filter (not managed by useDataTable since it's custom)
  const [typeFilter, setTypeFilter] = useState<
    "all" | "license" | "attachment" | "avatar" | "general"
  >("all");

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);

  // Use the new useDataTable hook for URL state
  const { queryState, tableState } = useDataTable({
    defaultPageSize: 20,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  // Query with combined state
  const { data, isLoading } = useQuery(
    trpc.admin.files.list.queryOptions({
      page: queryState.page,
      limit: queryState.limit,
      search: queryState.search || undefined,
      sortBy: queryState.sortBy as
        | "createdAt"
        | "fileSize"
        | "originalFilename"
        | undefined,
      sortOrder: queryState.sortOrder,
      type: typeFilter !== "all" ? typeFilter : undefined,
    }),
  );

  const { data: stats } = useQuery(trpc.admin.files.stats.queryOptions());

  const deleteMutation = useMutation(
    trpc.admin.files.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.admin.files.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.admin.files.stats.queryKey(),
        });
        toast.success("File deleted");
        setDeleteDialogOpen(false);
        setSelectedFile(null);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  // TanStack Table column definitions
  const columns = useMemo<ColumnDef<FileRecord>[]>(
    () => [
      {
        id: "file",
        accessorKey: "fileName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="File" />
        ),
        cell: ({ row }) => {
          const file = row.original;
          return (
            <div className="flex items-center gap-3">
              {getFileIcon(file.contentType)}
              <div>
                <p className="font-medium truncate max-w-[200px]">
                  {file.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.fileSize)}
                </p>
              </div>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: "type",
        accessorKey: "fileType",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.fileType ?? "unknown"}</Badge>
        ),
        enableSorting: false,
      },
      {
        id: "uploader",
        header: "Uploader",
        cell: ({ row }) => {
          const file = row.original;
          return (
            <div>
              <p className="text-sm">{file.uploaderName ?? "Unknown"}</p>
              <p className="text-xs text-muted-foreground">
                {file.uploaderEmail ?? "No email"}
              </p>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Uploaded" />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
        enableSorting: true,
      },
      {
        id: "actions",
        header: "",
        size: 50,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedFile(row.original);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
        enableSorting: false,
      },
    ],
    [],
  );

  // Predefined file types
  const fileTypes = ["license", "attachment", "avatar", "general"] as const;

  return (
    <div className="flex flex-col h-full min-w-0">
      <AdminHeader breadcrumbs={[{ label: "Files" }]} />

      <div className="flex-1 space-y-6 p-6 overflow-auto">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Total Files"
            value={stats?.totalFiles ?? 0}
            icon={FolderOpen}
          />
          <StatsCard
            title="Storage Used"
            value={formatBytes(stats?.totalSize ?? 0)}
            icon={HardDrive}
          />
          <StatsCard
            title="File Types"
            value={fileTypes.length}
            icon={FileIcon}
          />
        </div>

        {/* Storage by Type */}
        {stats?.byType && stats.byType.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            {stats.byType.map((item) => (
              <div key={item.type} className="rounded-lg border p-4 space-y-1">
                <p className="text-sm font-medium capitalize">
                  {item.type ?? "unknown"}
                </p>
                <p className="text-2xl font-bold">{item.count}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(item.size)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Custom Filters */}
        <div className="flex flex-wrap gap-2">
          <Select
            value={typeFilter}
            onValueChange={(val: "all") => setTypeFilter(val)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="File Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {fileTypes.map((type) => (
                <SelectItem key={type} value={type!}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data Table with nuqs URL state */}
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          pageCount={data?.pagination?.totalPages ?? 0}
          isLoading={isLoading}
          searchPlaceholder="Search files..."
          emptyMessage="No files found."
          showToolbar={true}
          getRowId={(row) => row.id}
          pagination={tableState.pagination}
          onPaginationChange={tableState.onPaginationChange}
          sorting={tableState.sorting}
          onSortingChange={tableState.onSortingChange}
          globalFilter={tableState.globalFilter}
          onGlobalFilterChange={tableState.onGlobalFilterChange}
        />
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedFile?.fileName}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (selectedFile) {
                  deleteMutation.mutate({ fileId: selectedFile.id });
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
