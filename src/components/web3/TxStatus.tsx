"use client";

import { CheckIcon, StatusDot } from "@/components/ui";
import type { NetworkConfig } from "@/config/networks";
import type { TxState } from "@/web3";
import { TxLink } from "./TxLink";

/** One-line status under an action button. Renders nothing while idle. */
export function TxStatus({ state, network, doneLabel = "Done" }: { state: TxState; network: NetworkConfig; doneLabel?: string }) {
  if (state.status === "idle") return null;
  return (
    <p aria-live="polite" className="flex flex-wrap items-center gap-2 text-small">
      {state.status === "signing" && (
        <>
          <StatusDot status="yours" pulse /> <span className="text-ink-700">Confirm in your wallet…</span>
        </>
      )}
      {state.status === "pending" && (
        <>
          <StatusDot status="live" pulse /> <span className="text-ink-700">Waiting for the block…</span> <TxLink hash={state.hash} network={network} />
        </>
      )}
      {state.status === "confirmed" && (
        <>
          <CheckIcon size={12} className="text-mint-500" /> <span className="text-ink-900">{doneLabel}</span> <TxLink hash={state.hash} network={network} />
        </>
      )}
      {(state.status === "rejected" || state.status === "failed") && <span className="text-danger-600">{state.error.message}</span>}
    </p>
  );
}
