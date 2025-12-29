"use client";

import { useFeatureFlag } from "@/libs/feature-flags/use-feature-flags";
import { FeatureFlagKey } from "@repo/api/server/utils/feature-flags";
import type { ReactNode } from "react";

/**
 * Component that conditionally renders children based on a feature flag
 *
 * Usage:
 * ```tsx
 * <FeatureGate flag="enableBetaFeatures">
 *   <BetaContent />
 * </FeatureGate>
 * ```
 */
interface FeatureGateProps {
  flag: FeatureFlagKey;
  children: ReactNode;
  fallback?: ReactNode;
  invert?: boolean;
}

export function FeatureGate({
  flag,
  children,
  fallback = null,
  invert = false,
}: FeatureGateProps) {
  const isEnabled = useFeatureFlag(flag);
  const shouldRender = invert ? !isEnabled : isEnabled;

  return <>{shouldRender ? children : fallback}</>;
}

/**
 * Component that renders children when feature is disabled
 *
 * Usage:
 * ```tsx
 * <FeatureGateOff flag="enableBetaFeatures">
 *   <ComingSoonMessage />
 * </FeatureGateOff>
 * ```
 */
export function FeatureGateOff({
  flag,
  children,
  fallback,
}: Omit<FeatureGateProps, "invert">) {
  return (
    <FeatureGate flag={flag} invert={true} fallback={fallback}>
      {children}
    </FeatureGate>
  );
}

/**
 * Component that renders different content based on multiple flags
 *
 * Usage:
 * ```tsx
 * <MultiFeatureGate
 *   flags={{
 *     enableDarkMode: <DarkModeContent />,
 *     enableBetaFeatures: <BetaContent />,
 *   }}
 *   fallback={<DefaultContent />}
 * />
 * ```
 */
interface MultiFeatureGateProps {
  flags: Partial<Record<FeatureFlagKey, ReactNode>>;
  fallback?: ReactNode;
  mode?: "any" | "all";
}

export function MultiFeatureGate({
  flags,
  fallback = null,
  mode = "any",
}: MultiFeatureGateProps) {
  const enabledFlags = Object.keys(flags).filter((key) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useFeatureFlag(key as FeatureFlagKey)
  );

  if (mode === "all") {
    const allEnabled = Object.keys(flags).every((key) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useFeatureFlag(key as FeatureFlagKey)
    );

    if (!allEnabled) {
      return <>{fallback}</>;
    }

    return <>{Object.values(flags)}</>;
  }

  // mode === 'any'
  if (enabledFlags.length === 0) {
    return <>{fallback}</>;
  }

  return (
    <>
      {enabledFlags.map((key) => (
        <div key={key}>{flags[key as FeatureFlagKey]}</div>
      ))}
    </>
  );
}
