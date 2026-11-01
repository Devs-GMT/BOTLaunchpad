"use client";

import { CopyButton, Pill } from "@/components/ui";
import type { NetworkConfig } from "@/config/networks";
import { cn } from "@/lib/cn";
import { addressUrl } from "@/lib/explorer";
import { shortAddress } from "@/lib/format";
import { useWallet } from "@/web3";

export interface AddressPillProps {
  address: string;
  network: NetworkConfig;
  /** Show a "You" pill when this address is the connected wallet. */
  markYou?: boolean;
  tone?: "light" | "dark";
  className?: string;
}

/** Short address linking to the explorer, with copy. Lilac when it's you. */
export function AddressPill({ address, network, markYou = true, tone = "light", className }: AddressPillProps) {
  const { address: me } = useWallet();
  const isYou = markYou && me?.toLowerCase() === address.toLowerCase();
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <a
        href={addressUrl(network, address)}
        target="_blank"
        rel="noopener noreferrer"
        title={address}
        className={cn(
          "font-mono text-mono tabular-nums underline decoration-1 underline-offset-4 transition-colors",
          tone === "light" ? "decoration-ink-900/20 hover:decoration-ink-900" : "decoration-paper-0/20 hover:decoration-paper-0",
          isYou && "bg-lilac-200 px-1 text-ink-900",
        )}
      >
        {shortAddress(address)}
      </a>
      {isYou && <Pill tone="lilac">You</Pill>}
      <CopyButton value={address} tone={tone} label="Copy" />
    </span>
  );
}
