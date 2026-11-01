import deployments from "@/generated/deployments.json";
import type { NetworkConfig } from "./networks";

type Deployment = { registry: `0x${string}`; blockNumber: number | null; txHash: string | null; deployedAt: string };

const byChain = deployments as Partial<Record<string, Deployment>>;

/** Registry deployment for a network, or undefined if it hasn't been deployed there yet. */
export function registryDeployment(network: Pick<NetworkConfig, "chainId">): Deployment | undefined {
  return byChain[String(network.chainId)];
}

export function registryAddress(network: Pick<NetworkConfig, "chainId">): `0x${string}` | undefined {
  return registryDeployment(network)?.registry;
}
