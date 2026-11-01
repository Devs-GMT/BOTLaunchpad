// Versioned localStorage helpers. Keys are documented in docs/ARCHITECTURE.md §7.

const PREFIX = "botlaunchpad:v1:";

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  window.dispatchEvent(new StorageEvent("storage", { key: PREFIX + key }));
}

export interface PendingLaunch {
  address: `0x${string}`;
  templateId: number;
  name: string;
  txHash: `0x${string}`;
  owner: `0x${string}`;
  /** ms since epoch */
  at: number;
}

const pendingKey = (chainId: number) => `pending:${chainId}`;

export function getPending(chainId: number): PendingLaunch[] {
  return readJSON<PendingLaunch[]>(pendingKey(chainId), []);
}

export function savePending(chainId: number, launch: PendingLaunch): void {
  const rest = getPending(chainId).filter((p) => p.address.toLowerCase() !== launch.address.toLowerCase());
  writeJSON(pendingKey(chainId), [launch, ...rest]);
}

export function removePending(chainId: number, address: string): void {
  writeJSON(
    pendingKey(chainId),
    getPending(chainId).filter((p) => p.address.toLowerCase() !== address.toLowerCase()),
  );
}
