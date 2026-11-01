"use client";

import { DotMatrixStack } from "@/components/graphics";
import { Kicker, Skeleton, StatusDot } from "@/components/ui";
import { formatNumber } from "@/lib/format";
import { useBlockNumber } from "@/web3";
import { liveNetwork } from "../liveNetwork";

// BOT Chain produces a block every ~0.75 s: 80 blocks ≈ 1 minute, 4,800 ≈ 1 hour.
const marks = [
  { label: "Latest block", back: 0 },
  { label: "1 min ago", back: 80 },
  { label: "1 hour ago", back: 4_800 },
] as const;

/** Hero art: stacked dot planes = blocks, with a vertical ledger of real block numbers beside them. */
export function BlockTimeline() {
  const { data: block, isError } = useBlockNumber(liveNetwork);

  return (
    <div className="relative flex items-stretch gap-4 sm:gap-8">
      <DotMatrixStack tick={block} className="mx-auto min-w-0 max-w-md flex-1" />
      <ol className="relative flex flex-col justify-between border-l border-ink-900/15 py-2 pl-4 sm:pl-6" aria-label="Recent blocks">
        {marks.map((m, i) => (
          <li key={m.label} className="relative flex flex-col gap-1">
            <span
              aria-hidden
              className={i === 0 ? "absolute -left-4.5 top-1 size-1.5 bg-mint-500 sm:-left-6.5" : "absolute -left-4.5 top-1 size-1.5 bg-ink-900/30 sm:-left-6.5"}
            />
            <Kicker className="text-micro">{m.label}</Kicker>
            <span className="font-mono text-mono tabular-nums text-ink-900">
              {block !== undefined ? `#${formatNumber(block - m.back)}` : isError ? "—" : <Skeleton className="h-3 w-20" />}
            </span>
          </li>
        ))}
        <li className="flex items-center gap-2">
          <StatusDot status={isError ? "idle" : "live"} pulse={!isError && block !== undefined} />
          <span className="font-mono text-micro uppercase text-ink-500">
            {isError ? "RPC not responding" : `${liveNetwork.shortName} · ${liveNetwork.chainId}`}
          </span>
        </li>
      </ol>
    </div>
  );
}
