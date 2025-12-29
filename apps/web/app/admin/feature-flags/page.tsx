"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEdgeTRPC } from "../../../libs/trpc/edge-utils";
import { AdminHeader } from "../../../components/admin/admin-header";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Switch } from "@repo/ui/components/ui/switch";
import { Label } from "@repo/ui/components/ui/label";
import { Badge } from "@repo/ui/components/ui/badge";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
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
import { toast } from "@repo/ui/components/ui/sonner";
import { RotateCcw, Flag, Sparkles, Shield, Zap, BarChart } from "lucide-react";

// Feature flag metadata for better UI
const flagMetadata: Record<
  string,
  {
    label: string;
    description: string;
    category: string;
    icon: React.ElementType;
  }
> = {
  enableOAuth: {
    label: "OAuth Login",
    description: "Allow users to sign in with social providers",
    category: "Authentication",
    icon: Shield,
  },
  enableMagicLink: {
    label: "Magic Link",
    description: "Allow passwordless email login",
    category: "Authentication",
    icon: Shield,
  },
  enableTwoFactor: {
    label: "Two-Factor Auth",
    description: "Enable 2FA for enhanced security",
    category: "Authentication",
    icon: Shield,
  },
  enableDarkMode: {
    label: "Dark Mode",
    description: "Allow users to toggle dark theme",
    category: "UI",
    icon: Sparkles,
  },
  enableBetaFeatures: {
    label: "Beta Features",
    description: "Show experimental features to users",
    category: "UI",
    icon: Sparkles,
  },
  enableAdvancedSearch: {
    label: "Advanced Search",
    description: "Enable advanced search capabilities",
    category: "UI",
    icon: Sparkles,
  },
  enableCaching: {
    label: "Caching",
    description: "Enable response caching for better performance",
    category: "Performance",
    icon: Zap,
  },
  enableEdgeRendering: {
    label: "Edge Rendering",
    description: "Render pages at the edge for faster delivery",
    category: "Performance",
    icon: Zap,
  },
  enablePremiumFeatures: {
    label: "Premium Features",
    description: "Enable premium/paid features",
    category: "Business",
    icon: BarChart,
  },
  enableAnalytics: {
    label: "Analytics",
    description: "Collect usage analytics",
    category: "Business",
    icon: BarChart,
  },
};

const categories = ["Authentication", "UI", "Performance", "Business"];

export default function FeatureFlagsPage() {
  const edgeTrpc = useEdgeTRPC();
  const queryClient = useQueryClient();

  const { data: flags, isLoading } = useQuery(
    edgeTrpc.featureFlags.getAll.queryOptions(),
  );

  const toggleMutation = useMutation(
    edgeTrpc.featureFlags.toggle.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: edgeTrpc.featureFlags.getAll.queryKey(),
        });
        toast.success(`${data.flag} ${data.value ? "enabled" : "disabled"}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const resetMutation = useMutation(
    edgeTrpc.featureFlags.reset.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: edgeTrpc.featureFlags.getAll.queryKey(),
        });
        toast.success("Feature flags reset to defaults");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  // Group flags by category
  const flagsByCategory = categories.reduce(
    (acc, category) => {
      acc[category] = Object.entries(flagMetadata)
        .filter(([, meta]) => meta.category === category)
        .map(([key, meta]) => ({
          key,
          ...meta,
          value: flags?.[key as keyof typeof flags] ?? false,
        }));
      return acc;
    },
    {} as Record<
      string,
      Array<{
        key: string;
        label: string;
        description: string;
        category: string;
        icon: React.ElementType;
        value: boolean;
      }>
    >,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col h-full min-w-0">
        <AdminHeader breadcrumbs={[{ label: "Feature Flags" }]} />
        <div className="p-6 space-y-6 overflow-auto">
          <Skeleton className="h-100 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-w-0">
      <AdminHeader breadcrumbs={[{ label: "Feature Flags" }]} />

      <div className="flex-1 space-y-6 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Flag className="h-6 w-6" />
              Feature Flags
            </h2>
            <p className="text-muted-foreground">
              Control feature availability across your application
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Defaults
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Feature Flags</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to reset all feature flags to their
                  default values? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => resetMutation.mutate()}>
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Flag Categories */}
        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((category) => {
            const categoryFlags = flagsByCategory[category];
            if (!categoryFlags?.length) return null;

            const CategoryIcon = categoryFlags[0]?.icon ?? Flag;

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CategoryIcon className="h-5 w-5" />
                    {category}
                  </CardTitle>
                  <CardDescription>
                    {category === "Authentication" &&
                      "Control authentication methods and security features"}
                    {category === "UI" &&
                      "Manage user interface features and themes"}
                    {category === "Performance" &&
                      "Configure caching and rendering optimizations"}
                    {category === "Business" &&
                      "Enable business and analytics features"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoryFlags.map((flag) => (
                    <div
                      key={flag.key}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={flag.key}
                            className="font-medium cursor-pointer"
                          >
                            {flag.label}
                          </Label>
                          <Badge
                            variant={flag.value ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {flag.value ? "ON" : "OFF"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {flag.description}
                        </p>
                      </div>
                      <Switch
                        id={flag.key}
                        checked={flag.value}
                        onCheckedChange={() =>
                          toggleMutation.mutate({ key: flag.key })
                        }
                        disabled={toggleMutation.isPending}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">About Feature Flags</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Feature flags allow you to enable or disable features without
              deploying new code. Changes take effect immediately across your
              application.
            </p>
            <p>
              <strong>Note:</strong> In this starter kit, feature flags are
              stored in memory. For production use, consider persisting them to
              a database or using a dedicated feature flag service.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
