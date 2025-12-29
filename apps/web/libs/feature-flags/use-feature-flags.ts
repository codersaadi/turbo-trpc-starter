"use client";

import { useEffect, useCallback } from "react";
import { useEdgeTRPC } from "@/libs/trpc/edge-utils";
import {
  useFeatureFlagsStore,
  useFeatureFlag as useFeatureFlagStore,
  useFeatureFlags as useFeatureFlagsAll,
} from "@/libs/feature-flags/store";
import type { FeatureFlagKey, FeatureFlagContext } from "@/libs/feature-flags";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to sync feature flags from server to Zustand store
 *
 * Usage:
 * ```tsx
 * function App() {
 *   useFeatureFlagsSync();
 *   return <YourApp />;
 * }
 * ```
 */
export function useFeatureFlagsSync(options?: {
  enabled?: boolean;
  refetchInterval?: number;
  context?: FeatureFlagContext;
}) {
  const { enabled = true, refetchInterval, context } = options || {};

  const setFlags = useFeatureFlagsStore((state) => state.setFlags);
  const setLoading = useFeatureFlagsStore((state) => state.setLoading);
  const setError = useFeatureFlagsStore((state) => state.setError);
  const setContext = useFeatureFlagsStore((state) => state.setContext);

  const edgeTRPC = useEdgeTRPC();

  // Fetch feature flags from server using edge tRPC
  const queryContext = context
    ? edgeTRPC.featureFlags.getWithContext.queryOptions(context, {
        enabled,
        refetchInterval,
      })
    : edgeTRPC.featureFlags.getAll.queryOptions(undefined, {
        enabled,
        refetchInterval,
      });

  const query = useQuery(queryContext);

  // Sync flags to store when query data changes
  useEffect(() => {
    if (query.data) {
      setFlags(query.data);
      setLoading(false);
      setError(null);
    }
  }, [query.data, setFlags, setLoading, setError]);

  // Sync loading state
  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  // Sync error state
  useEffect(() => {
    if (query.error) {
      setError(query.error.message);
    }
  }, [query.error, setError]);

  // Sync context
  useEffect(() => {
    if (context) {
      setContext(context);
    }
  }, [context, setContext]);

  return {
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to get a single feature flag value
 *
 * Usage:
 * ```tsx
 * const isDarkModeEnabled = useFeatureFlag('enableDarkMode');
 * ```
 */
export function useFeatureFlag(key: FeatureFlagKey): boolean {
  return useFeatureFlagStore(key);
}

/**
 * Hook to get all feature flags
 *
 * Usage:
 * ```tsx
 * const flags = useFeatureFlags();
 * console.log(flags.enableDarkMode);
 * ```
 */
export function useFeatureFlags() {
  return useFeatureFlagsAll();
}

/**
 * Hook to check if a feature is enabled (alias for useFeatureFlag)
 *
 * Usage:
 * ```tsx
 * const isEnabled = useIsFeatureEnabled('enableBetaFeatures');
 * ```
 */
export function useIsFeatureEnabled(key: FeatureFlagKey): boolean {
  return useFeatureFlagStore(key);
}

/**
 * Hook to update feature flags (admin only)
 *
 * Usage:
 * ```tsx
 * const { updateFlag, isUpdating } = useUpdateFeatureFlag();
 *
 * await updateFlag({ key: 'enableDarkMode', value: true });
 * ```
 */
export function useUpdateFeatureFlag() {
  const edgeTRPC = useEdgeTRPC();
  const queryClient = useQueryClient();
  const mutation = useMutation(edgeTRPC.featureFlags.update.mutationOptions());
  const setFlag = useFeatureFlagsStore((state) => state.setFlag);

  const updateFlag = useCallback(
    async (input: { key: FeatureFlagKey; value: boolean }) => {
      // Optimistically update the store
      setFlag(input.key, input.value);

      try {
        // Update on server
        await mutation.mutateAsync(input);

        // Invalidate and refetch
        await queryClient.invalidateQueries(
          edgeTRPC.featureFlags.getAll.queryFilter()
        );
      } catch (error) {
        // Revert on error
        setFlag(input.key, !input.value);
        throw error;
      }
    },
    [mutation, setFlag, queryClient, edgeTRPC]
  );

  return {
    updateFlag,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to toggle a feature flag
 *
 * Usage:
 * ```tsx
 * const { toggleFlag, isToggling } = useToggleFeatureFlag();
 *
 * await toggleFlag('enableDarkMode');
 * ```
 */
export function useToggleFeatureFlag() {
  const edgeTRPC = useEdgeTRPC();
  const mutation = useMutation(edgeTRPC.featureFlags.toggle.mutationOptions());
  const toggleFlag = useFeatureFlagsStore((state) => state.toggleFlag);
  const queryClient = useQueryClient();

  const toggle = useCallback(
    async (key: FeatureFlagKey) => {
      // Optimistically toggle in store
      toggleFlag(key);

      try {
        // Toggle on server
        await mutation.mutateAsync({ key });

        // Invalidate and refetch
        await queryClient.invalidateQueries(
          edgeTRPC.featureFlags.getAll.queryFilter()
        );
      } catch (error) {
        // Revert on error
        toggleFlag(key);
        throw error;
      }
    },
    [mutation, toggleFlag, queryClient, edgeTRPC]
  );

  return {
    toggleFlag: toggle,
    isToggling: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to reset all feature flags to defaults
 *
 * Usage:
 * ```tsx
 * const { resetFlags, isResetting } = useResetFeatureFlags();
 *
 * await resetFlags();
 * ```
 */
export function useResetFeatureFlags() {
  const edgeTRPC = useEdgeTRPC();
  const mutation = useMutation(edgeTRPC.featureFlags.reset.mutationOptions());
  const resetFlags = useFeatureFlagsStore((state) => state.resetFlags);
  const queryClient = useQueryClient();

  const reset = useCallback(async () => {
    // Reset in store
    resetFlags();

    try {
      // Reset on server
      await mutation.mutateAsync();

      // Invalidate and refetch
      await queryClient.invalidateQueries(
        edgeTRPC.featureFlags.getAll.queryFilter()
      );
    } catch (error) {
      // Refetch to get current state
      await queryClient.refetchQueries(
        edgeTRPC.featureFlags.getAll.queryFilter()
      );
      throw error;
    }
  }, [mutation, resetFlags, edgeTRPC, queryClient]);

  return {
    resetFlags: reset,
    isResetting: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to check multiple feature flags at once
 *
 * Usage:
 * ```tsx
 * const flags = useCheckFeatureFlags(['enableDarkMode', 'enableBetaFeatures']);
 * console.log(flags.enableDarkMode, flags.enableBetaFeatures);
 * ```
 */
export function useCheckFeatureFlags(keys: FeatureFlagKey[]) {
  const edgeTRPC = useEdgeTRPC();
  return useQuery(edgeTRPC.featureFlags.checkMany.queryOptions({ keys }));
}
