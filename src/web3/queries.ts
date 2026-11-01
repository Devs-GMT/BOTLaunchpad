"use client";

import { useQuery } from "@tanstack/react-query";
import type { NetworkConfig } from "@/config/networks";
import { readProvider } from "./providers";
import { getLaunchesOf, getRecentLaunches, getStats, hasRegistry } from "./registry";

// Query keys: [entity, chainId, ...args]. Invalidate with the same prefix after writes.
export const queryKeys = {
  blockNumber: (chainId: number) => ["blockNumber", chainId] as const,
  stats: (chainId: number) => ["stats", chainId] as const,
  recentLaunches: (chainId: number, count: number) => ["launches", chainId, "recent", count] as const,
  launchesOf: (chainId: number, owner: string) => ["launches", chainId, "of", owner.toLowerCase()] as const,
  launchesPrefix: (chainId: number) => ["launches", chainId] as const,
};

/** Latest block, polled every 3 s (blocks are ~0.75 s; the UI doesn't need more). */
export function useBlockNumber(network: NetworkConfig) {
  return useQuery({
    queryKey: queryKeys.blockNumber(network.chainId),
    queryFn: () => readProvider(network).getBlockNumber(),
    refetchInterval: 3_000,
    staleTime: 2_000,
    retry: 1,
  });
}

export function useRegistryStats(network: NetworkConfig) {
  return useQuery({
    queryKey: queryKeys.stats(network.chainId),
    queryFn: () => getStats(network),
    enabled: hasRegistry(network),
    staleTime: 30_000,
  });
}

export function useRecentLaunches(network: NetworkConfig, count = 6) {
  return useQuery({
    queryKey: queryKeys.recentLaunches(network.chainId, count),
    queryFn: () => getRecentLaunches(network, count),
    enabled: hasRegistry(network),
    staleTime: 15_000,
  });
}

export function useLaunchesOf(network: NetworkConfig, owner: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.launchesOf(network.chainId, owner ?? ""),
    queryFn: () => getLaunchesOf(network, owner!),
    enabled: hasRegistry(network) && Boolean(owner),
  });
}
