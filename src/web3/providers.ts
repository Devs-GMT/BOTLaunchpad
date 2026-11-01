import { JsonRpcProvider, Network } from "ethers";
import type { NetworkConfig } from "@/config/networks";

const cache = new Map<number, JsonRpcProvider>();

/** Read-only provider for a network. Works without a wallet. */
export function readProvider(network: Pick<NetworkConfig, "chainId" | "rpcUrl" | "name">): JsonRpcProvider {
  let provider = cache.get(network.chainId);
  if (!provider) {
    const net = new Network(network.name, network.chainId);
    provider = new JsonRpcProvider(network.rpcUrl, net, { staticNetwork: net, batchMaxCount: 10 });
    cache.set(network.chainId, provider);
  }
  return provider;
}
