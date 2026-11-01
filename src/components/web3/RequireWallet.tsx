"use client";

import type { ReactNode } from "react";
import { Button, LinkButton } from "@/components/ui";
import type { NetworkConfig } from "@/config/networks";
import { useWallet } from "@/web3";

export interface RequireWalletProps {
  /** Network the action must run on. */
  network: NetworkConfig;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** Renders the next missing step (install → connect → switch) in place of a write button. */
export function RequireWallet({ network, children, size = "md", className }: RequireWalletProps) {
  const { status, chainId, connect, switchTo } = useWallet();

  if (status === "detecting") return <Button size={size} disabled className={className}>Looking for your wallet…</Button>;
  if (status === "unavailable") {
    return (
      <div className="flex flex-col gap-2">
        <LinkButton href="https://metamask.io/download/" external size={size} className={className}>
          Install MetaMask
        </LinkButton>
        <p className="text-small text-ink-500">You can still browse templates and read the code without a wallet.</p>
      </div>
    );
  }
  if (status !== "connected") {
    return (
      <Button size={size} onClick={connect} disabled={status === "connecting"} className={className}>
        {status === "connecting" ? "Check your wallet…" : "Connect wallet"}
      </Button>
    );
  }
  if (chainId !== network.chainId) {
    return (
      <Button size={size} onClick={() => switchTo(network)} className={className}>
        Switch to {network.name}
      </Button>
    );
  }
  return <>{children}</>;
}
