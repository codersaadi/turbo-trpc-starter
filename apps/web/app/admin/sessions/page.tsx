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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
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
import { Switch } from "@repo/ui/components/ui/switch";
import { Label } from "@repo/ui/components/ui/label";
import { Key, Trash2, Activity, Clock } from "lucide-react";
import { toast } from "@repo/ui/components/ui/sonner";

type Session = {
  id: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
  impersonatedBy: string | null;
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
};

function formatUserAgent(ua: string | null): string {
  if (!ua) return "Unknown";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "Other";
}

export default function SessionsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Active only filter (not managed by useDataTable since it's custom)
  const [activeOnly, setActiveOnly] = useState(true);

  // Dialogs
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Use the new useDataTable hook for URL state
  const { queryState, tableState } = useDataTable({
    defaultPageSize: 20,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  // Query with combined state
  const { data, isLoading } = useQuery(
    trpc.admin.sessions.list.queryOptions({
      page: queryState.page,
      limit: queryState.limit,
      search: queryState.search || undefined,
      activeOnly,
    }),
  );

  const { data: stats } = useQuery(trpc.admin.sessions.stats.queryOptions());

  const revokeMutation = useMutation(
    trpc.admin.sessions.revoke.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.admin.sessions.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.admin.sessions.stats.queryKey(),
        });
        toast.success("Session revoked");
        setRevokeDialogOpen(false);
        setSelectedSession(null);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const revokeExpiredMutation = useMutation(
    trpc.admin.sessions.revokeExpired.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: trpc.admin.sessions.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.admin.sessions.stats.queryKey(),
        });
        toast.success(`Cleaned up ${data.count} expired sessions`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  // TanStack Table column definitions
  const columns = useMemo<ColumnDef<Session>[]>(
    () => [
      {
        id: "user",
        accessorKey: "userName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="User" />
        ),
        cell: ({ row }) => {
          const session = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.userImage ?? undefined} />
                <AvatarFallback>
                  {session.userName?.charAt(0).toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{session.userName ?? "Unknown"}</p>
                <p className="text-sm text-muted-foreground">
                  {session.userEmail ?? "No email"}
                </p>
              </div>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: "device",
        header: "Device",
        cell: ({ row }) => {
          const session = row.original;
          return (
            <div>
              <p className="text-sm">{formatUserAgent(session.userAgent)}</p>
              <p className="text-xs text-muted-foreground">
                {session.ipAddress ?? "Unknown IP"}
              </p>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const isActive = new Date(row.original.expiresAt) > new Date();
          return (
            <Badge variant={isActive ? "secondary" : "outline"}>
              {isActive ? "Active" : "Expired"}
            </Badge>
          );
        },
        enableSorting: false,
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
        enableSorting: true,
      },
      {
        id: "expiresAt",
        accessorKey: "expiresAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Expires" />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.expiresAt).toLocaleDateString()}
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
              setSelectedSession(row.original);
              setRevokeDialogOpen(true);
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

  return (
    <div className="flex flex-col h-full min-w-0">
      <AdminHeader breadcrumbs={[{ label: "Sessions" }]} />

      <div className="flex-1 space-y-6 p-6 overflow-auto">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Active Sessions"
            value={stats?.active ?? 0}
            icon={Activity}
          />
          <StatsCard
            title="Expired Sessions"
            value={stats?.expired ?? 0}
            icon={Clock}
          />
          <StatsCard
            title="Total Sessions"
            value={stats?.total ?? 0}
            icon={Key}
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="active-only"
              checked={activeOnly}
              onCheckedChange={setActiveOnly}
            />
            <Label htmlFor="active-only">Active sessions only</Label>
          </div>

          <Button
            variant="outline"
            onClick={() => revokeExpiredMutation.mutate()}
            disabled={revokeExpiredMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clean Up Expired
          </Button>
        </div>

        {/* Data Table with nuqs URL state */}
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          pageCount={data?.pagination?.totalPages ?? 0}
          isLoading={isLoading}
          searchPlaceholder="Search by user or IP..."
          emptyMessage="No sessions found."
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

      {/* Revoke Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this session for{" "}
              {selectedSession?.userName}? They will be logged out immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedSession) {
                  revokeMutation.mutate({ sessionId: selectedSession.id });
                }
              }}
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
