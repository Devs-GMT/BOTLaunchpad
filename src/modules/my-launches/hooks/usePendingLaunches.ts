"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { PendingLaunch } from "@/lib/storage";

const key = (chainId: number) => `botlaunchpad:v1:pending:${chainId}`;

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/** Deploys made in this browser that aren't listed yet. Reads the raw string so the snapshot is stable. */
export function usePendingLaunches(chainId: number): PendingLaunch[] {
  const raw = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(key(chainId)) ?? "[]",
    () => "[]",
  );
  return useMemo(() => {
    try {
      return JSON.parse(raw) as PendingLaunch[];
    } catch {
      return [];
    }
  }, [raw]);
}
