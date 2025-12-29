"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "../../libs/trpc/trpc-utils";
import { StatsCard } from "../../components/admin/stats-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
  Users,
  Key,
  FolderOpen,
  UserCheck,
  UserX,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export default function AdminDashboard() {
  const trpc = useTRPC();

  const { data: stats, isLoading: statsLoading } = useQuery(
    trpc.admin.stats.overview.queryOptions(),
  );

  const { data: userGrowth, isLoading: growthLoading } = useQuery(
    trpc.admin.stats.userGrowth.queryOptions({ days: 30 }),
  );

  const { data: recentSignups, isLoading: signupsLoading } = useQuery(
    trpc.admin.stats.recentSignups.queryOptions({ limit: 5 }),
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex-1 space-y-6 p-6 overflow-auto">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-32 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatsCard
                title="Total Users"
                value={stats?.users.total ?? 0}
                description={`+${stats?.users.new24h ?? 0} in last 24h`}
                icon={Users}
              />
              <StatsCard
                title="Active Sessions"
                value={stats?.sessions.active ?? 0}
                description="Currently active"
                icon={Key}
              />
              <StatsCard
                title="Verified Users"
                value={stats?.users.verified ?? 0}
                description={`${stats?.users.total ? Math.round((stats.users.verified / stats.users.total) * 100) : 0}% of total`}
                icon={UserCheck}
              />
              <StatsCard
                title="Storage Used"
                value={formatBytes(stats?.files.totalSize ?? 0)}
                description={`${stats?.files.total ?? 0} files`}
                icon={FolderOpen}
              />
            </>
          )}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          {/* User Growth Chart */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                User Growth (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {growthLoading ? (
                <Skeleton className="h-75 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={userGrowth?.map((d) => ({
                      ...d,
                      date: formatDate(new Date(d.date)),
                    }))}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorCount"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorCount)"
                      name="New Users"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent Signups */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Signups</CardTitle>
            </CardHeader>
            <CardContent>
              {signupsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentSignups?.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No recent signups
                </p>
              ) : (
                <div className="space-y-4">
                  {recentSignups?.map((user) => (
                    <div key={user.id} className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image ?? undefined} />
                        <AvatarFallback>
                          {user.name?.charAt(0).toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                New Users (7d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  (stats?.users.new7d ?? 0)
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                New Users (30d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  (stats?.users.new30d ?? 0)
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserX className="h-4 w-4" />
                Banned Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  (stats?.users.banned ?? 0)
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
