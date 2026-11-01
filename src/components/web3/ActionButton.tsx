"use client";

import { Button, type ButtonProps } from "@/components/ui";
import type { NetworkConfig } from "@/config/networks";
import type { TxState } from "@/web3";
import { RequireWallet } from "./RequireWallet";
import { TxStatus } from "./TxStatus";

export interface ActionButtonProps extends Omit<ButtonProps, "onClick"> {
  network: NetworkConfig;
  state: TxState;
  onAction: () => void;
  /** Why the action is unavailable (poll ended, already voted…). Shown instead of firing. */
  disabledReason?: string | null;
  doneLabel?: string;
}

/** Wallet gate + button + live tx status, the standard shape of every Interact write. */
export function ActionButton({ network, state, onAction, disabledReason, doneLabel, children, ...props }: ActionButtonProps) {
  const busy = state.status === "signing" || state.status === "pending";
  return (
    <div className="flex flex-col items-start gap-2">
      <RequireWallet network={network} size={props.size ?? "md"}>
        <Button {...props} onClick={onAction} disabled={busy || Boolean(disabledReason) || props.disabled}>
          {busy ? (state.status === "signing" ? "Check your wallet…" : "Sending…") : children}
        </Button>
      </RequireWallet>
      {disabledReason && state.status === "idle" ? (
        <p className="text-small text-ink-500">{disabledReason}</p>
      ) : (
        <TxStatus state={state} network={network} doneLabel={doneLabel} />
      )}
    </div>
  );
}
