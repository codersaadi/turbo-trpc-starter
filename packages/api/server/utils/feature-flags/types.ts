import { z } from "zod";

/**
 * Feature flag configuration schema
 * Add new feature flags here with their default values
 */
export const featureFlagsSchema = z.object({
  // Authentication Features
  enableOAuth: z.boolean().default(true),
  enableMagicLink: z.boolean().default(true),
  enableTwoFactor: z.boolean().default(false),

  // UI Features
  enableDarkMode: z.boolean().default(true),
  enableBetaFeatures: z.boolean().default(false),
  enableAdvancedSearch: z.boolean().default(false),

  // Performance Features
  enableCaching: z.boolean().default(true),
  enableEdgeRendering: z.boolean().default(false),

  // Business Features
  enablePremiumFeatures: z.boolean().default(false),
  enableAnalytics: z.boolean().default(true),
});

/**
 * Inferred TypeScript type from the schema
 * This ensures type safety across the application
 */
export type FeatureFlags = z.infer<typeof featureFlagsSchema>;

/**
 * Individual feature flag key type
 */
export type FeatureFlagKey = keyof FeatureFlags;

/**
 * Feature flag update payload
 */
export const featureFlagUpdateSchema = z.object({
  key: z.string() as z.ZodType<FeatureFlagKey>,
  value: z.boolean(),
});

export type FeatureFlagUpdate = z.infer<typeof featureFlagUpdateSchema>;

/**
 * Feature flag override context
 * Useful for A/B testing, user-specific overrides, etc.
 */
export interface FeatureFlagContext {
  userId?: string;
  environment?: "development" | "staging" | "production";
  customOverrides?: Partial<FeatureFlags>;
}

/**
 * Default feature flags - ensures type safety and provides fallbacks
 */
export const defaultFeatureFlags: FeatureFlags = featureFlagsSchema.parse({});
