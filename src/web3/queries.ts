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

/** Current gas price in wei. BOT Chain sits at a flat 20 gwei, so a minute of staleness is fine. */
export function useGasPrice(network: NetworkConfig) {
  return useQuery({
    queryKey: ["gasPrice", network.chainId] as const,
    queryFn: async () => (await readProvider(network).getFeeData()).gasPrice ?? 20_000_000_000n,
    staleTime: 60_000,
  });
}

export function useBalance(network: NetworkConfig, address: string | null | undefined) {
  return useQuery({
    queryKey: ["balance", network.chainId, address?.toLowerCase() ?? ""] as const,
    queryFn: () => readProvider(network).getBalance(address!),
    enabled: Boolean(address),
    staleTime: 10_000,
  });
}

export interface BlockSummary {
  number: number;
  /** unix seconds */
  timestamp: number;
  txCount: number;
}

/** Header facts for one block. Past blocks never change, so they're cached for the session. */
export function useBlockSummary(network: NetworkConfig, number: number | undefined) {
  return useQuery({
    queryKey: ["block", network.chainId, number ?? -1] as const,
    queryFn: async (): Promise<BlockSummary | null> => {
      const block = await readProvider(network).getBlock(number!);
      return block && { number: block.number, timestamp: block.timestamp, txCount: block.transactions.length };
    },
    enabled: number !== undefined && number >= 0,
    staleTime: Infinity,
    placeholderData: (prev) => prev,
  });
}
