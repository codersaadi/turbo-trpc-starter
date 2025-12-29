"use client";

import {
  useFeatureFlags,
  useToggleFeatureFlag,
  useResetFeatureFlags,
} from "@/libs/feature-flags/use-feature-flags";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui-components/ui/card";
import { Switch } from "@ui-components/ui/switch";
import { Button } from "@ui-components/ui/button";
import { Badge } from "@ui-components/ui/badge";
import { Loader2, RotateCcw } from "lucide-react";

import { FeatureFlagKey } from "@repo/api/server/utils/feature-flags";

/**
 * Admin panel for managing feature flags
 * Requires authentication to use toggle/reset mutations
 */
export function FeatureFlagsAdminPanel() {
  const flags = useFeatureFlags();
  const { toggleFlag, isToggling } = useToggleFeatureFlag();
  const { resetFlags, isResetting } = useResetFeatureFlags();

  const handleToggle = async (key: FeatureFlagKey) => {
    try {
      await toggleFlag(key);
    } catch (error) {
      console.error("Failed to toggle feature flag:", error);
    }
  };

  const handleReset = async () => {
    try {
      await resetFlags();
    } catch (error) {
      console.error("Failed to reset feature flags:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Feature Flags</CardTitle>
            <CardDescription>
              Enable or disable features across the application
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isResetting}
          >
            {isResetting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            <span className="ml-2">Reset All</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(flags).map(([key, value]) => (
            <FeatureFlagItem
              key={key}
              flagKey={key as FeatureFlagKey}
              value={value}
              onToggle={handleToggle}
              isToggling={isToggling}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface FeatureFlagItemProps {
  flagKey: FeatureFlagKey;
  value: boolean;
  onToggle: (key: FeatureFlagKey) => Promise<void>;
  isToggling: boolean;
}

function FeatureFlagItem({
  flagKey,
  value,
  onToggle,
  isToggling,
}: FeatureFlagItemProps) {
  // Convert camelCase to readable format
  const readableName = flagKey
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();

  // Categorize flags by prefix
  const category = flagKey.startsWith("enable")
    ? flagKey.substring(6).match(/[A-Z][a-z]+/)?.[0] || "General"
    : "General";

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{readableName}</h4>
          <Badge variant={value ? "default" : "secondary"} className="text-xs">
            {value ? "Enabled" : "Disabled"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {getFeatureFlagDescription(flagKey)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isToggling ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Switch
            checked={value}
            onCheckedChange={() => onToggle(flagKey)}
            aria-label={`Toggle ${readableName}`}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Get human-readable description for each feature flag
 */
function getFeatureFlagDescription(key: FeatureFlagKey): string {
  const descriptions: Record<FeatureFlagKey, string> = {
    enableOAuth: "Allow users to sign in with third-party OAuth providers",
    enableMagicLink: "Enable passwordless authentication via email magic links",
    enableTwoFactor: "Require two-factor authentication for enhanced security",
    enableDarkMode: "Allow users to switch between light and dark themes",
    enableBetaFeatures: "Show experimental features to users",
    enableAdvancedSearch: "Enable advanced search filters and capabilities",
    enableCaching: "Cache API responses for improved performance",
    enableEdgeRendering: "Render pages at the edge for faster load times",
    enablePremiumFeatures: "Unlock premium features for subscribed users",
    enableAnalytics: "Collect anonymous analytics data",
  };

  return descriptions[key] || "No description available";
}
