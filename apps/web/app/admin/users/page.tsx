"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../../../libs/trpc/trpc-utils";
import { useSession } from "../../../libs/auth-client";
import { AdminHeader } from "../../../components/admin/admin-header";
import {
  DataTable,
  DataTableColumnHeader,
  useDataTable,
} from "@repo/ui/components/data-table";
import type { ColumnDef } from "@repo/ui/components/data-table";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
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
import { MoreHorizontal, Ban, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "@repo/ui/components/ui/sonner";

type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string | null;
  emailVerified: boolean;
  banned: boolean | null;
  banReason: string | null;
  isActive: boolean | null;
  isVerified: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function UsersPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // Status/role filters (not managed by useDataTable since they're custom)
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Dialogs
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Use the new useDataTable hook for URL state
  const { queryState, tableState } = useDataTable({
    defaultPageSize: 20,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  // Query with combined state
  const { data, isLoading } = useQuery(
    trpc.admin.users.list.queryOptions({
      page: queryState.page,
      limit: queryState.limit,
      search: queryState.search || undefined,
      sortBy: queryState.sortBy as
        | "createdAt"
        | "name"
        | "email"
        | "updatedAt"
        | undefined,
      sortOrder: queryState.sortOrder,
      status:
        statusFilter !== "all"
          ? (statusFilter as "active" | "banned" | "unverified")
          : undefined,
      role:
        roleFilter !== "all"
          ? (roleFilter as "user" | "admin" | "moderator")
          : undefined,
    }),
  );

  // Mutations
  const banMutation = useMutation(
    trpc.admin.users.setBanStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.admin.users.list.queryKey(),
        });
        toast.success(selectedUser?.banned ? "User unbanned" : "User banned");
        setBanDialogOpen(false);
        setSelectedUser(null);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.admin.users.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.admin.users.list.queryKey(),
        });
        toast.success("User deleted");
        setDeleteDialogOpen(false);
        setSelectedUser(null);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const roleMutation = useMutation(
    trpc.admin.users.updateRole.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.admin.users.list.queryKey(),
        });
        toast.success("Role updated");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  // TanStack Table column definitions
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: "user",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="User" />
        ),
        cell: ({ row }) => {
          const user = row.original;
          const isCurrentUser = user.id === currentUserId;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback>
                  {user.name?.charAt(0).toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium flex items-center gap-2">
                  {user.name}
                  {isCurrentUser && (
                    <Badge variant="outline" className="text-xs">
                      You
                    </Badge>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: "role",
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const user = row.original;
          const isCurrentUser = user.id === currentUserId;
          return (
            <Select
              value={user.role ?? "user"}
              onValueChange={(value) => {
                roleMutation.mutate({
                  userId: user.id,
                  role: value as "user" | "admin" | "moderator",
                });
              }}
              disabled={isCurrentUser}
            >
              <SelectTrigger className="w-30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          );
        },
        enableSorting: false,
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex flex-wrap gap-1">
              {user.banned && <Badge variant="destructive">Banned</Badge>}
              {user.emailVerified ? (
                <Badge variant="secondary">Verified</Badge>
              ) : (
                <Badge variant="outline">Unverified</Badge>
              )}
              {user.isActive === false && (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Joined" />
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
        cell: ({ row }) => {
          const user = row.original;
          const isCurrentUser = user.id === currentUserId;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/users/${user.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                {!isCurrentUser && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedUser(user);
                        setBanDialogOpen(true);
                      }}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      {user.banned ? "Unban User" : "Ban User"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        setSelectedUser(user);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
      },
    ],
    [currentUserId, roleMutation],
  );

  return (
    <div className="flex flex-col h-full min-w-0">
      <AdminHeader breadcrumbs={[{ label: "Users" }]} />

      <div className="flex-1 space-y-4 p-6 overflow-auto">
        {/* Custom Filters (status/role) */}
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-37.5">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-37.5">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Table with nuqs URL state */}
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          pageCount={data?.pagination?.totalPages ?? 0}
          isLoading={isLoading}
          searchPlaceholder="Search users..."
          emptyMessage="No users found."
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

      {/* Ban Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.banned ? "Unban User" : "Ban User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.banned
                ? `Are you sure you want to unban ${selectedUser?.name}?`
                : `Are you sure you want to ban ${selectedUser?.name}? They will be logged out and unable to access the platform.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedUser) {
                  banMutation.mutate({
                    userId: selectedUser.id,
                    banned: !selectedUser.banned,
                    banReason: selectedUser.banned
                      ? undefined
                      : "Banned by admin",
                  });
                }
              }}
            >
              {selectedUser?.banned ? "Unban" : "Ban"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (selectedUser) {
                  deleteMutation.mutate({ userId: selectedUser.id });
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
