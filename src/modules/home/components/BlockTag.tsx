"use client";

import { Skeleton } from "@/components/ui";
import { formatNumber, relativeTime } from "@/lib/format";
import { useNow } from "@/lib/useNow";
import { useBlockSummary, type BlockSummary } from "@/web3";
import { liveNetwork } from "@/config/addresses";

/** Floating label on the lifted plane: real block number, transaction count and age. */
interface BlockTagProps {
  number: number | undefined;
  label: string;
  /** The latest block keeps showing the previous one while the next loads, instead of a skeleton every 3 s. */
  live?: boolean;
  unavailable?: boolean;
}

export function BlockTag({ number, label, live, unavailable }: BlockTagProps) {
  const { data: loaded } = useBlockSummary(liveNetwork, number);
  const data = loaded && (live || loaded.number === number) ? loaded : undefined;
  return (
    <div className="flex min-w-40 flex-col gap-0.5 border border-ink-900/15 bg-paper-50 px-2 py-1.5">
      <span className="font-mono text-micro uppercase text-ink-500">{label}</span>
      {unavailable ? (
        <span className="text-small text-ink-500">Chain not reachable</span>
      ) : data ? (
        <Facts block={data} />
      ) : (
        <>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </>
      )}
    </div>
  );
}

/** Mounted only once a block has loaded, so the prerender never reads the clock. */
function Facts({ block }: { block: BlockSummary }) {
  const now = useNow(5_000);
  return (
    <>
      <span className="text-small font-medium tabular-nums text-ink-900">Block #{formatNumber(block.number)}</span>
      <span className="font-mono text-micro uppercase tabular-nums text-ink-500">
        {block.txCount} {block.txCount === 1 ? "tx" : "txs"} · {relativeTime(block.timestamp, now * 1000)}
      </span>
    </>
  );
}
