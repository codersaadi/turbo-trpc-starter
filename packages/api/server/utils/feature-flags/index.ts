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
} from "./types";

export {
  featureFlagsSchema,
  featureFlagUpdateSchema,
  defaultFeatureFlags,
} from "./types";
