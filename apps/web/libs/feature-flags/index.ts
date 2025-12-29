/**
 * Feature Flags System - Central Exports
 *
 * Import everything you need from here:
 * ```ts
 * import { useFeatureFlag, FeatureFlags } from '@/lib/feature-flags';
 * ```
 */

// Types
export type {
  FeatureFlags,
  FeatureFlagKey,
  FeatureFlagUpdate,
  FeatureFlagContext,
} from "@repo/api/server/utils/feature-flags/types";

export {
  featureFlagsSchema,
  featureFlagUpdateSchema,
  defaultFeatureFlags,
} from "@repo/api/server/utils/feature-flags/types";

// Store
export {
  useFeatureFlagsStore,
  useFeatureFlag as useFeatureFlagFromStore,
  useFeatureFlags as useFeatureFlagsFromStore,
  useFeatureFlagsLoading,
  useFeatureFlagsError,
} from "./store";

export type { FeatureFlagsStore } from "./store";
