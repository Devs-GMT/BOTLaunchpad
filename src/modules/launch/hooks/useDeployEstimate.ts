"use client";

import { useQuery } from "@tanstack/react-query";
import { ContractFactory } from "ethers";
import type { NetworkConfig } from "@/config/networks";
import type { Template } from "@/templates";
import { readProvider, useGasPrice } from "@/web3";

/** Measured on testnet: register() costs 200–234k gas. */
export const REGISTER_GAS = 240_000n;

const stringify = (v: unknown) => JSON.stringify(v, (_, x) => (typeof x === "bigint" ? x.toString() : x));

/** Live estimateGas for the exact deploy transaction, falling back to the measured deployGas. */
export function useDeployEstimate(template: Template, args: unknown[] | null, network: NetworkConfig, from?: string | null) {
  const { data: gasPrice } = useGasPrice(network);
  const gas = useQuery({
    queryKey: ["deployEstimate", network.chainId, template.slug, stringify(args), from ?? ""] as const,
    enabled: Boolean(args),
    staleTime: 30_000,
    retry: 0,
    queryFn: async () => {
      const factory = new ContractFactory(template.artifact.abi, template.artifact.bytecode);
      const tx = await factory.getDeployTransaction(...(args ?? []));
      return readProvider(network).estimateGas({ data: tx.data, from: from ?? undefined });
    },
  });

  const deployGas = gas.data ?? BigInt(template.artifact.deployGas);
  return {
    isLoading: gas.isLoading || gasPrice === undefined,
    isFallback: !gas.data,
    deployGas,
    gasPrice,
    deployCost: gasPrice !== undefined ? deployGas * gasPrice : undefined,
    registerCost: gasPrice !== undefined ? REGISTER_GAS * gasPrice : undefined,
  };
}
