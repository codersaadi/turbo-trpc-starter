"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "../../libs/trpc/trpc-utils";
import { StatsCard } from "../../components/admin/stats-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  ArrowUpRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your system&apos;s performance and activity.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card
                  key={i}
                  className="overflow-hidden border-border/50 shadow-sm"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
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
                trend={{
                  value: stats?.users.total
                    ? Math.round(
                        ((stats.users.new24h ?? 0) / stats.users.total) * 100,
                      )
                    : 0,
                  label: "growth",
                }}
              />
              <StatsCard
                title="Active Sessions"
                value={stats?.sessions.active ?? 0}
                description="Currently online"
                icon={Key}
              />
              <StatsCard
                title="Verified Users"
                value={stats?.users.verified ?? 0}
                description={`${stats?.users.total ? Math.round((stats.users.verified / stats.users.total) * 100) : 0}% verification rate`}
                icon={UserCheck}
              />
              <StatsCard
                title="Storage Used"
                value={formatBytes(stats?.files.totalSize ?? 0)}
                description={`${stats?.files.total ?? 0} total files uploaded`}
                icon={FolderOpen}
              />
            </>
          )}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
          {/* User Growth Chart */}
          <Card className="lg:col-span-4 overflow-hidden border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                User Growth
              </CardTitle>
              <CardDescription>
                New user registrations over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              {growthLoading ? (
                <div className="p-4">
                  <Skeleton className="h-75 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
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
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                      opacity={0.4}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 12,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                    />
                    <YAxis
                      tick={{
                        fontSize: 12,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      tickMargin={10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                      labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCount)"
                      name="New Users"
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent Signups */}
          <Card className="lg:col-span-3 overflow-hidden border-border/50 shadow-sm flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Signups</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>
                Latest users to join the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
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
                <div className="flex h-full items-center justify-center p-6 text-center text-muted-foreground">
                  No recent signups found
                </div>
              ) : (
                <div className="space-y-6">
                  {recentSignups?.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border border-border/50">
                          <AvatarImage src={user.image ?? undefined} />
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
                            {user.name?.charAt(0).toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
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
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border/50 shadow-sm hover:border-primary/20 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
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
          <Card className="border-border/50 shadow-sm hover:border-primary/20 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
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
          <Card className="border-border/50 shadow-sm hover:border-destructive/20 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
                <UserX className="h-4 w-4" />
                Banned Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
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
