"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../../../../libs/trpc/trpc-utils";
import { AdminHeader } from "../../../../components/admin/admin-header";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/ui/alert-dialog";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Separator } from "@repo/ui/components/ui/separator";
import { toast } from "@repo/ui/components/ui/sonner";
import {
  ArrowLeft,
  Ban,
  Trash2,
  Key,
  Mail,
  Calendar,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const userId = params.id as string;

  const { data: user, isLoading } = useQuery(
    trpc.admin.users.getById.queryOptions({ id: userId }),
  );

  const banMutation = useMutation(
    trpc.admin.users.setBanStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.admin.users.getById.queryKey({ id: userId }),
        });
        toast.success(user?.banned ? "User unbanned" : "User banned");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.admin.users.delete.mutationOptions({
      onSuccess: () => {
        toast.success("User deleted");
        router.push("/admin/users");
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
          queryKey: trpc.admin.users.getById.queryKey({ id: userId }),
        });
        toast.success("Role updated");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const revokeSessionsMutation = useMutation(
    trpc.admin.users.revokeSessions.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.admin.users.getById.queryKey({ id: userId }),
        });
        toast.success("All sessions revoked");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <AdminHeader
          breadcrumbs={[
            { label: "Users", href: "/admin/users" },
            { label: "Loading..." },
          ]}
        />
        <div className="p-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col">
        <AdminHeader
          breadcrumbs={[
            { label: "Users", href: "/admin/users" },
            { label: "Not Found" },
          ]}
        />
        <div className="p-6">
          <p className="text-muted-foreground">User not found</p>
          <Button asChild className="mt-4">
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <AdminHeader
        breadcrumbs={[
          { label: "Users", href: "/admin/users" },
          { label: user.name },
        ]}
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0).toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {user.banned && <Badge variant="destructive">Banned</Badge>}
                  {user.emailVerified ? (
                    <Badge variant="secondary">Email Verified</Badge>
                  ) : (
                    <Badge variant="outline">Email Unverified</Badge>
                  )}
                  {user.isVerified && (
                    <Badge variant="secondary">Verified Account</Badge>
                  )}
                  {user.isTwoFactorEnabled && (
                    <Badge variant="secondary">2FA Enabled</Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={user.banned ? "outline" : "destructive"}
                  size="sm"
                  onClick={() => {
                    banMutation.mutate({
                      userId: user.id,
                      banned: !user.banned,
                      banReason: user.banned ? undefined : "Banned by admin",
                    });
                  }}
                  disabled={banMutation.isPending}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  {user.banned ? "Unban" : "Ban"}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {user.name}? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() =>
                          deleteMutation.mutate({ userId: user.id })
                        }
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                User Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>

                {user.username && (
                  <div className="flex items-center gap-4">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Username</p>
                      <p className="text-sm text-muted-foreground">
                        @{user.displayUsername ?? user.username}
                      </p>
                    </div>
                  </div>
                )}

                {user.phoneNumber && (
                  <div className="flex items-center gap-4">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        {user.phoneNumber}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Joined</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {user.bio && (
                  <div>
                    <p className="text-sm font-medium mb-1">Bio</p>
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role & Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Role</p>
                <Select
                  value={user.role ?? "user"}
                  onValueChange={(value) => {
                    roleMutation.mutate({
                      userId: user.id,
                      role: value as "user" | "admin" | "moderator",
                    });
                  }}
                >
                  <SelectTrigger className="w-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Active Sessions</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {user.activeSessions}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      revokeSessionsMutation.mutate({ userId: user.id })
                    }
                    disabled={
                      revokeSessionsMutation.isPending ||
                      user.activeSessions === 0
                    }
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Revoke All
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Connected Accounts</p>
                {user.accounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No connected accounts
                  </p>
                ) : (
                  <div className="space-y-2">
                    {user.accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted"
                      >
                        <span className="text-sm font-medium capitalize">
                          {account.providerId}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Connected{" "}
                          {new Date(account.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {user.banned && user.banReason && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2 text-destructive">
                      Ban Reason
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.banReason}
                    </p>
                    {user.banExpires && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Expires:{" "}
                        {new Date(user.banExpires).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Back Button */}
        <Button variant="outline" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
      </div>
    </div>
  );
}
