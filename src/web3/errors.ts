import { isError, type Interface } from "ethers";

export type FriendlyErrorKind = "rejected" | "insufficient-funds" | "revert" | "network" | "unknown";

export interface FriendlyError {
  kind: FriendlyErrorKind;
  message: string;
  /** Custom error name when the revert could be decoded (e.g. "AlreadyVoted"). */
  errorName?: string;
}

/** Copy for registry and template errors lives next to their ABIs; this is the fallback for everything else. */
const GENERIC: Record<FriendlyErrorKind, string> = {
  rejected: "You cancelled the transaction in your wallet.",
  "insufficient-funds": "Not enough BOT to pay for gas.",
  revert: "The contract rejected this transaction.",
  network: "The network didn't respond. Check your connection and try again.",
  unknown: "Something went wrong. Try again.",
};

function revertData(err: unknown): string | undefined {
  const e = err as { data?: unknown; info?: { error?: { data?: unknown } }; error?: { data?: unknown } };
  for (const d of [e?.data, e?.info?.error?.data, e?.error?.data]) {
    if (typeof d === "string" && d.startsWith("0x") && d.length >= 10) return d;
    const nested = (d as { data?: unknown } | undefined)?.data;
    if (typeof nested === "string" && nested.startsWith("0x")) return nested;
  }
  return undefined;
}

function isUserRejection(err: unknown): boolean {
  if (isError(err, "ACTION_REJECTED")) return true;
  const e = err as { code?: unknown; info?: { error?: { code?: unknown } } };
  return e?.code === 4001 || e?.info?.error?.code === 4001;
}

/**
 * Map any wallet/RPC/contract error to user-facing copy.
 * @param abi Interfaces whose custom errors may appear (template, registry).
 * @param copy CustomErrorName → sentence.
 */
export function friendlyError(err: unknown, abi: Interface[] = [], copy: Record<string, string> = {}): FriendlyError {
  if (isUserRejection(err)) return { kind: "rejected", message: GENERIC.rejected };
  if (isError(err, "INSUFFICIENT_FUNDS")) return { kind: "insufficient-funds", message: GENERIC["insufficient-funds"] };

  const decodedName = (err as { revert?: { name?: string } })?.revert?.name;
  let errorName = decodedName;
  if (!errorName) {
    const data = revertData(err);
    if (data) {
      for (const iface of abi) {
        const parsed = iface.parseError(data);
        if (parsed) {
          errorName = parsed.name;
          break;
        }
      }
    }
  }
  if (errorName) return { kind: "revert", errorName, message: copy[errorName] ?? GENERIC.revert };
  if (isError(err, "CALL_EXCEPTION")) return { kind: "revert", message: GENERIC.revert };

  const msg = String((err as { message?: unknown })?.message ?? "");
  if (/insufficient funds/i.test(msg)) return { kind: "insufficient-funds", message: GENERIC["insufficient-funds"] };
  if (isError(err, "NETWORK_ERROR") || isError(err, "TIMEOUT") || isError(err, "SERVER_ERROR")) {
    return { kind: "network", message: GENERIC.network };
  }
  return { kind: "unknown", message: GENERIC.unknown };
}
