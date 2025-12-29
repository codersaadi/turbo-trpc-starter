import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "../../../server/trpc/edge";
import {
  featureFlagsSchema,
  featureFlagUpdateSchema,
  defaultFeatureFlags,
  type FeatureFlags,
  type FeatureFlagKey,
} from "../../utils/feature-flags";

/**
 * In-memory storage for feature flags
 * In production, you'd want to use a database or Redis
 */
let featureFlagsStore: FeatureFlags = { ...defaultFeatureFlags };

/**
 * Feature Flags Router
 *
 * This router runs on the edge and provides endpoints for:
 * - Getting all feature flags
 * - Getting a specific feature flag
 * - Updating feature flags (admin only)
 * - Resetting feature flags to defaults
 */
export const featureFlagsRouter = createTRPCRouter({
  /**
   * Get all feature flags
   * Public endpoint - anyone can view current flags
   */
  getAll: publicProcedure.output(featureFlagsSchema).query(async () => {
    return featureFlagsStore;
  }),

  /**
   * Get a specific feature flag value
   */
  get: publicProcedure
    .input(
      z.object({
        key: z.string(),
      })
    )
    .output(z.boolean())
    .query(async ({ input }) => {
      return featureFlagsStore[input.key as FeatureFlagKey];
    }),

  /**
   * Check if a feature is enabled
   * Alias for get, but more semantic
   */
  isEnabled: publicProcedure
    .input(
      z.object({
        key: z.string(),
      })
    )
    .output(z.boolean())
    .query(async ({ input }) => {
      return featureFlagsStore[input.key as FeatureFlagKey];
    }),

  /**
   * Update a single feature flag
   * Protected endpoint - requires authentication
   */
  update: protectedProcedure
    .input(featureFlagUpdateSchema)
    .output(
      z.object({
        success: z.boolean(),
        flag: z.string(),
        value: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      // Validate that the key exists in the schema
      if (!(input.key in featureFlagsStore)) {
        throw new Error(`Invalid feature flag key: ${input.key}`);
      }

      // Update the flag
      featureFlagsStore[input.key] = input.value;

      return {
        success: true,
        flag: input.key,
        value: input.value,
      };
    }),

  /**
   * Update multiple feature flags at once
   * Protected endpoint - requires authentication
   */
  updateMany: protectedProcedure
    .input(
      z.object({
        flags: z.record(z.string(), z.boolean()),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        updated: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      let updated = 0;

      // Validate and update each flag
      for (const [key, value] of Object.entries(input.flags)) {
        if (key in featureFlagsStore) {
          featureFlagsStore[key as FeatureFlagKey] = value;
          updated++;
        }
      }

      return {
        success: true,
        updated,
      };
    }),

  /**
   * Toggle a feature flag
   * Protected endpoint - requires authentication
   */
  toggle: protectedProcedure
    .input(
      z.object({
        key: z.string(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        flag: z.string(),
        value: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const key = input.key as FeatureFlagKey;

      if (!(key in featureFlagsStore)) {
        throw new Error(`Invalid feature flag key: ${input.key}`);
      }

      // Toggle the flag
      featureFlagsStore[key] = !featureFlagsStore[key];

      return {
        success: true,
        flag: input.key,
        value: featureFlagsStore[key],
      };
    }),

  /**
   * Reset all feature flags to defaults
   * Protected endpoint - requires authentication
   */
  reset: protectedProcedure
    .output(
      z.object({
        success: z.boolean(),
        message: z.string(),
      })
    )
    .mutation(async () => {
      featureFlagsStore = { ...defaultFeatureFlags };

      return {
        success: true,
        message: "Feature flags reset to defaults",
      };
    }),

  /**
   * Get feature flags with context
   * Useful for A/B testing or user-specific overrides
   */
  getWithContext: publicProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        environment: z
          .enum(["development", "staging", "production"])
          .optional(),
        customOverrides: z.record(z.string(), z.boolean()).optional(),
      })
    )
    .output(featureFlagsSchema)
    .query(async ({ input }) => {
      let flags = { ...featureFlagsStore };

      // Apply environment-specific overrides
      if (input.environment === "development") {
        // In development, enable beta features by default
        flags.enableBetaFeatures = true;
      }

      // Apply custom overrides if provided
      if (input.customOverrides) {
        flags = {
          ...flags,
          ...input.customOverrides,
        };
      }

      return flags;
    }),

  /**
   * Batch check multiple feature flags
   */
  checkMany: publicProcedure
    .input(
      z.object({
        keys: z.array(z.string()),
      })
    )
    .output(z.record(z.string(), z.boolean()))
    .query(async ({ input }) => {
      const result: Record<string, boolean> = {};

      for (const key of input.keys) {
        if (key in featureFlagsStore) {
          result[key] = featureFlagsStore[key as FeatureFlagKey];
        }
      }

      return result;
    }),
});
