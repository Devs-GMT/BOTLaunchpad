"use client";

import Link from "next/link";
import { Skeleton, StatusDot } from "@/components/ui";
import { cn } from "@/lib/cn";
import { shortAddress } from "@/lib/format";
import { useSelectedNetwork, useWallet } from "@/web3";

const METAMASK_URL = "https://metamask.io/download/";

/** Navbar wallet chip: status dot + network + short address. Lilac dot = your wallet on BOT Chain. */
export function ConnectButton({ className }: { className?: string }) {
  const { status, address, network, connect, switchTo } = useWallet();
  const [selected] = useSelectedNetwork();
  const base = cn("inline-flex h-9 items-center gap-2 px-3 text-small font-medium tracking-button transition-colors", className);

  if (status === "detecting") return <Skeleton className="h-9 w-32" />;

  if (status === "unavailable") {
    return (
      <a href={METAMASK_URL} target="_blank" rel="noopener noreferrer" className={cn(base, "text-ink-900 hover:bg-ink-900/5")}>
        Install MetaMask
      </a>
    );
  }

  if (status !== "connected" || !address) {
    return (
      <button type="button" onClick={connect} disabled={status === "connecting"} className={cn(base, "cursor-pointer text-ink-900 hover:bg-ink-900/5 disabled:opacity-60")}>
        {status === "connecting" ? "Check your wallet…" : "Connect wallet"}
      </button>
    );
  }

  if (!network) {
    return (
      <button type="button" onClick={() => switchTo(selected)} className={cn(base, "cursor-pointer border border-ember-500/50 text-ink-900 hover:bg-ember-500/10")}>
        <StatusDot status="old" />
        Switch to BOT Chain
      </button>
    );
  }

  return (
    <Link href="/my" className={cn(base, "border border-ink-900/12 bg-paper-0 text-ink-900 hover:border-ink-500/50")} title={`${address} on ${network.name}`}>
      <StatusDot status="yours" />
      <span className="font-mono text-micro uppercase text-ink-500">{network.shortName}</span>
      <span className="font-mono text-mono tabular-nums">{shortAddress(address)}</span>
    </Link>
  );
}
