import deployments from "@/generated/deployments.json";
import { networks, type NetworkConfig, type NetworkKey } from "./networks";

type Deployment = { registry: `0x${string}`; blockNumber: number | null; txHash: string | null; deployedAt: string };

const byChain = deployments as Partial<Record<string, Deployment>>;

/** Registry deployment for a network, or undefined if it hasn't been deployed there yet. */
export function registryDeployment(network: Pick<NetworkConfig, "chainId">): Deployment | undefined {
  return byChain[String(network.chainId)];
}

export function registryAddress(network: Pick<NetworkConfig, "chainId">): `0x${string}` | undefined {
  return registryDeployment(network)?.registry;
}

/**
 * Network preselected for launching. Testnet until the Mainnet registry exists, then Mainnet.
 * (URLs without `?net=` still mean Mainnet: see DEFAULT_NETWORK.)
 */
export const DEFAULT_LAUNCH_NETWORK: NetworkKey = byChain[String(networks.mainnet.chainId)] ? "mainnet" : "testnet";

/** Where live numbers (home page, footer status row) come from: the network people launch on. */
export const liveNetwork = networks[DEFAULT_LAUNCH_NETWORK];
