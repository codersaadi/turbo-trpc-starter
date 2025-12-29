import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
// Types
import type {
  FeatureFlags,
  FeatureFlagKey,
  FeatureFlagContext,
} from "@repo/api/server/utils/feature-flags/types";

import { defaultFeatureFlags } from "@repo/api/server/utils/feature-flags/types";

/**
 * Feature Flags Store State
 */
interface FeatureFlagsState {
  // Current feature flags
  flags: FeatureFlags;

  // Loading state for async operations
  isLoading: boolean;

  // Error state
  error: string | null;

  // Last updated timestamp
  lastUpdated: number | null;

  // Context for overrides
  context: FeatureFlagContext | null;
}

/**
 * Feature Flags Store Actions
 */
interface FeatureFlagsActions {
  // Set all feature flags at once
  setFlags: (flags: Partial<FeatureFlags>) => void;

  // Toggle a single feature flag
  toggleFlag: (key: FeatureFlagKey) => void;

  // Set a single feature flag
  setFlag: (key: FeatureFlagKey, value: boolean) => void;

  // Get a single feature flag value
  getFlag: (key: FeatureFlagKey) => boolean;

  // Check if a feature is enabled (alias for getFlag)
  isEnabled: (key: FeatureFlagKey) => boolean;

  // Reset all flags to defaults
  resetFlags: () => void;

  // Set loading state
  setLoading: (isLoading: boolean) => void;

  // Set error state
  setError: (error: string | null) => void;

  // Set context for overrides
  setContext: (context: FeatureFlagContext) => void;
}

/**
 * Combined store type
 */
export type FeatureFlagsStore = FeatureFlagsState & FeatureFlagsActions;

/**
 * Create the feature flags store with Zustand
 *
 * Features:
 * - Immer for immutable state updates
 * - Persist middleware for localStorage persistence
 * - DevTools for debugging in development
 */
export const useFeatureFlagsStore = create<FeatureFlagsStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial State
        flags: defaultFeatureFlags,
        isLoading: false,
        error: null,
        lastUpdated: null,
        context: null,

        // Actions
        setFlags: (newFlags) => {
          set((state) => {
            state.flags = { ...state.flags, ...newFlags };
            state.lastUpdated = Date.now();
            state.error = null;
          });
        },

        toggleFlag: (key) => {
          set((state) => {
            state.flags[key] = !state.flags[key];
            state.lastUpdated = Date.now();
          });
        },

        setFlag: (key, value) => {
          set((state) => {
            state.flags[key] = value;
            state.lastUpdated = Date.now();
          });
        },

        getFlag: (key) => {
          const state = get();
          // Apply context overrides if available
          if (state.context?.customOverrides?.[key] !== undefined) {
            return state.context.customOverrides[key];
          }
          return state.flags[key];
        },

        isEnabled: (key) => {
          return get().getFlag(key);
        },

        resetFlags: () => {
          set((state) => {
            state.flags = defaultFeatureFlags;
            state.lastUpdated = Date.now();
            state.error = null;
          });
        },

        setLoading: (isLoading) => {
          set((state) => {
            state.isLoading = isLoading;
          });
        },

        setError: (error) => {
          set((state) => {
            state.error = error;
            state.isLoading = false;
          });
        },

        setContext: (context) => {
          set((state) => {
            state.context = context;
          });
        },
      })),
      {
        name: "feature-flags-storage",
        // Only persist the flags, not loading/error states
        partialize: (state) => ({
          flags: state.flags,
          lastUpdated: state.lastUpdated,
        }),
      }
    ),
    {
      name: "FeatureFlagsStore",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);

/**
 * Selector hooks for optimized re-renders
 */
export const useFeatureFlag = (key: FeatureFlagKey): boolean => {
  return useFeatureFlagsStore((state) => state.getFlag(key));
};

export const useFeatureFlags = (): FeatureFlags => {
  return useFeatureFlagsStore((state) => state.flags);
};

export const useFeatureFlagsLoading = (): boolean => {
  return useFeatureFlagsStore((state) => state.isLoading);
};

export const useFeatureFlagsError = (): string | null => {
  return useFeatureFlagsStore((state) => state.error);
};
