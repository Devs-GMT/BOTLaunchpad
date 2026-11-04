"use client";

import type { ReactNode } from "react";
import { CopyButton, LinkButton, Skeleton, StatusDot } from "@/components/ui";
import { liveNetwork, registryAddress } from "@/config/addresses";
import { external } from "@/config/site";
import { addressUrl } from "@/lib/explorer";
import { formatNumber, shortAddress } from "@/lib/format";
import { useBlockNumber, useRegistryStats } from "@/web3";
import { BotChainLogo } from "./BotChainLogo";

const registry = registryAddress(liveNetwork);

/** Live "system status" for BOT Chain: block, launches, registry. Grey dot when the RPC doesn't answer. */
export function FooterStatus() {
  const block = useBlockNumber(liveNetwork);
  const stats = useRegistryStats(liveNetwork);
  const down = block.isError;

  return (
    <div className="flex flex-col gap-5 border-y border-paper-0/10 py-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <span className="flex items-center gap-2 text-small text-paper-50">
          <StatusDot status={down ? "idle" : "live"} pulse={!down && block.data !== undefined} />
          {down ? "RPC not responding" : "Live"}
        </span>
        <a
          href={external.botchain}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-small font-medium text-paper-50 transition-colors hover:text-teal-300"
        >
          <BotChainLogo className="h-5" />
          BOT Chain
        </a>
        <Stat label="Chain ID">{liveNetwork.chainId}</Stat>
        <Stat label="Block">{block.data !== undefined ? `#${formatNumber(block.data)}` : down ? "—" : <Dark />}</Stat>
        <Stat label="Contracts launched">
          {stats.data ? formatNumber(stats.data.total) : stats.isError || !registry ? "—" : <Dark />}
        </Stat>
        {registry && (
          <span className="flex items-center gap-2">
            <Stat label="Registry">{shortAddress(registry)}</Stat>
            <CopyButton value={registry} label="Copy" tone="dark" />
          </span>
        )}
      </div>
      {registry && (
        <LinkButton href={addressUrl(liveNetwork, registry)} external variant="teal" size="sm" className="self-start lg:self-auto">
          View on explorer
        </LinkButton>
      )}
    </div>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="flex items-center gap-2 font-mono text-micro uppercase">
      <span className="text-paper-500">{label}</span>
      <span className="normal-case tabular-nums text-paper-50">{children}</span>
    </span>
  );
}

function Dark() {
  return <Skeleton className="h-3 w-16 bg-coal-700" />;
}
