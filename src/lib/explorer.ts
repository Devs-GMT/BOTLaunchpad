import type { NetworkConfig } from "@/config/networks";

export function txUrl(network: Pick<NetworkConfig, "explorerUrl">, hash: string): string {
  return `${network.explorerUrl}/tx/${hash}`;
}

export function addressUrl(network: Pick<NetworkConfig, "explorerUrl">, address: string): string {
  return `${network.explorerUrl}/address/${address}`;
}

/** In-app link to a contract's Interact page. The only place that knows the route shape. */
export function contractHref(address: string, network?: Pick<NetworkConfig, "key">, opts?: { fresh?: boolean }): string {
  const params = new URLSearchParams();
  if (network && network.key !== "mainnet") params.set("net", network.key);
  if (opts?.fresh) params.set("new", "1");
  const q = params.toString();
  return `/c/${address}${q ? `?${q}` : ""}`;
}
