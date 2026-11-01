// Single source of truth for BOT Chain network constants (verified against the live RPCs, 2026-11-01).

export type NetworkKey = "mainnet" | "testnet";

export interface NetworkConfig {
  key: NetworkKey;
  chainId: 677 | 968;
  name: string;
  shortName: string;
  rpcUrl: string;
  explorerUrl: string;
  faucetUrl: string | null;
  currency: { name: string; symbol: string; decimals: 18 };
}

export const networks: Record<NetworkKey, NetworkConfig> = {
  mainnet: {
    key: "mainnet",
    chainId: 677,
    name: "BOT Chain Mainnet",
    shortName: "Mainnet",
    rpcUrl: "https://rpc.botchain.ai",
    explorerUrl: "https://scan.botchain.ai",
    faucetUrl: null,
    currency: { name: "BOT", symbol: "BOT", decimals: 18 },
  },
  testnet: {
    key: "testnet",
    chainId: 968,
    name: "BOT Chain Testnet",
    shortName: "Testnet",
    rpcUrl: "https://rpc.bohr.life",
    explorerUrl: "https://scan.bohr.life",
    faucetUrl: "https://faucet.botchain.ai",
    currency: { name: "BOT", symbol: "BOT", decimals: 18 },
  },
};

export const DEFAULT_NETWORK: NetworkKey = "mainnet";

export const networkList = [networks.mainnet, networks.testnet] as const;

export function networkByChainId(chainId: number | bigint | null | undefined): NetworkConfig | undefined {
  if (chainId == null) return undefined;
  const id = Number(chainId);
  return networkList.find((n) => n.chainId === id);
}

export function isNetworkKey(value: unknown): value is NetworkKey {
  return value === "mainnet" || value === "testnet";
}

/** Params for `wallet_addEthereumChain` (EIP-3085). */
export function addChainParams(n: NetworkConfig) {
  return {
    chainId: `0x${n.chainId.toString(16)}`,
    chainName: n.name,
    nativeCurrency: n.currency,
    rpcUrls: [n.rpcUrl],
    blockExplorerUrls: [n.explorerUrl],
  };
}
