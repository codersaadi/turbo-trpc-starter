"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../../../libs/trpc/trpc-utils";
import { AdminHeader } from "../../../components/admin/admin-header";
import { DataTable, Column } from "../../../components/admin/data-table";
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
import { useDebounce } from "@repo/ui/hooks/use-debounce";
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

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const debouncedSearch = useDebounce(search, 300);

  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const { data, isLoading } = useQuery(
    trpc.admin.sessions.list.queryOptions({
      page,
      limit,
      search: debouncedSearch || undefined,
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

  const columns: Column<Session>[] = [
    {
      key: "user",
      header: "User",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.userImage ?? undefined} />
            <AvatarFallback>
              {row.userName?.charAt(0).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.userName ?? "Unknown"}</p>
            <p className="text-sm text-muted-foreground">
              {row.userEmail ?? "No email"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "device",
      header: "Device",
      cell: (row) => (
        <div>
          <p className="text-sm">{formatUserAgent(row.userAgent)}</p>
          <p className="text-xs text-muted-foreground">
            {row.ipAddress ?? "Unknown IP"}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => {
        const isActive = new Date(row.expiresAt) > new Date();
        return (
          <Badge variant={isActive ? "secondary" : "outline"}>
            {isActive ? "Active" : "Expired"}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "expiresAt",
      header: "Expires",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.expiresAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[50px]",
      cell: (row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedSession(row);
            setRevokeDialogOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

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

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          searchPlaceholder="Search by user or IP..."
          search={search}
          onSearchChange={setSearch}
          pagination={data?.pagination}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          emptyMessage="No sessions found."
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
