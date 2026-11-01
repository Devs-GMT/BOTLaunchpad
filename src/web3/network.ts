"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_LAUNCH_NETWORK } from "@/config/addresses";
import { isNetworkKey, networks, type NetworkConfig, type NetworkKey } from "@/config/networks";
import { readJSON, writeJSON } from "@/lib/storage";

// The network the user picked for launching (Mainnet / Testnet toggle). Pages that are addressed by URL
// (/c/[address]?net=) read the network from the URL instead and pass it down explicitly.

const KEY = "net";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function snapshot(): NetworkKey {
  const v = readJSON<unknown>(KEY, DEFAULT_LAUNCH_NETWORK);
  return isNetworkKey(v) ? v : DEFAULT_LAUNCH_NETWORK;
}

export function useSelectedNetwork(): [NetworkConfig, (key: NetworkKey) => void] {
  const key = useSyncExternalStore(subscribe, snapshot, () => DEFAULT_LAUNCH_NETWORK);
  const set = useCallback((k: NetworkKey) => writeJSON(KEY, k), []);
  return [networks[key], set];
}
