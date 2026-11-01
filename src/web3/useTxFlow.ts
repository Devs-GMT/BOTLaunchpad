"use client";

import type { Interface, TransactionReceipt, TransactionResponse } from "ethers";
import { useCallback, useEffect, useRef, useState } from "react";
import { friendlyError, type FriendlyError } from "./errors";

export type TxState =
  | { status: "idle" }
  | { status: "signing" }
  | { status: "pending"; hash: `0x${string}` }
  | { status: "confirmed"; hash: `0x${string}`; receipt: TransactionReceipt }
  | { status: "rejected"; error: FriendlyError }
  | { status: "failed"; hash?: `0x${string}`; error: FriendlyError };

export interface TxFlowOptions {
  /** Interfaces used to decode custom errors. */
  abi?: Interface[];
  /** Custom error name → friendly copy. */
  errors?: Record<string, string>;
  onConfirmed?: (receipt: TransactionReceipt) => void;
}

/**
 * One state machine for every write: idle → signing → pending(hash) → confirmed | rejected | failed.
 * `send` takes a function that asks the wallet to sign and returns the broadcast transaction.
 */
export function useTxFlow(options: TxFlowOptions = {}) {
  const [state, setState] = useState<TxState>({ status: "idle" });
  const opts = useRef(options);
  useEffect(() => {
    opts.current = options;
  });

  const send = useCallback(async (submit: () => Promise<TransactionResponse | null>) => {
    setState({ status: "signing" });
    let hash: `0x${string}` | undefined;
    try {
      const tx = await submit();
      if (!tx) throw new Error("Wallet returned no transaction");
      hash = tx.hash as `0x${string}`;
      setState({ status: "pending", hash });
      const receipt = await tx.wait();
      if (!receipt || receipt.status !== 1) throw Object.assign(new Error("Transaction reverted"), { code: "CALL_EXCEPTION" });
      setState({ status: "confirmed", hash, receipt });
      opts.current.onConfirmed?.(receipt);
      return receipt;
    } catch (err) {
      const error = friendlyError(err, opts.current.abi, opts.current.errors);
      setState(error.kind === "rejected" ? { status: "rejected", error } : { status: "failed", hash, error });
      return null;
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return {
    state,
    send,
    reset,
    isBusy: state.status === "signing" || state.status === "pending",
  };
}
