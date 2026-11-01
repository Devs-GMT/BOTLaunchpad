"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_NETWORK, isNetworkKey, networks, type NetworkConfig, type NetworkKey } from "@/config/networks";
import { readJSON, writeJSON } from "@/lib/storage";

// The network the user picked for launching (Mainnet / Testnet toggle). Pages that are addressed by URL
// (/c/[address]?net=) read the network from the URL instead and pass it down explicitly.

const KEY = "net";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function snapshot(): NetworkKey {
  const v = readJSON<unknown>(KEY, DEFAULT_NETWORK);
  return isNetworkKey(v) ? v : DEFAULT_NETWORK;
}

export function useSelectedNetwork(): [NetworkConfig, (key: NetworkKey) => void] {
  const key = useSyncExternalStore(subscribe, snapshot, () => DEFAULT_NETWORK);
  const set = useCallback((k: NetworkKey) => writeJSON(KEY, k), []);
  return [networks[key], set];
}

/** Network from a `?net=` value, defaulting to mainnet. */
export function networkFromParam(value: string | null | undefined): NetworkConfig {
  return isNetworkKey(value) ? networks[value] : networks[DEFAULT_NETWORK];
}
