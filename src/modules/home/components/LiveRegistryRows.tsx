"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui";
import { contractHref } from "@/lib/explorer";
import { relativeTime } from "@/lib/format";
import { useNow } from "@/lib/useNow";
import { templateById } from "@/templates";
import { useRecentLaunches } from "@/web3";
import { liveNetwork } from "@/config/addresses";

const ROWS = 3;

/** The newest registry entries, as mono ledger rows. Real data only: skeletons while loading. */
export function LiveRegistryRows() {
  const { data, isPending, isError } = useRecentLaunches(liveNetwork, ROWS);

  let body;
  if (isError) body = <Empty>Registry not reachable right now.</Empty>;
  else if (isPending)
    body = Array.from({ length: ROWS }, (_, i) => (
      <li key={i} className="flex h-10 items-center justify-between border-b border-ink-900/8">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-12" />
      </li>
    ));
  else if (!data?.length) body = <Empty>No launches yet. Yours can be the first.</Empty>;
  else
    body = data.map((launch) => (
      <li key={launch.id}>
        <Link
          href={contractHref(launch.contractAddr, liveNetwork)}
          className="flex h-10 items-center justify-between gap-3 border-b border-ink-900/8 text-small transition-colors hover:bg-ink-900/3"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="font-mono text-micro uppercase text-ink-500">{templateById(launch.templateId)?.title ?? "Contract"}</span>
            <span className="truncate text-ink-900">{launch.name}</span>
          </span>
          <span className="shrink-0 font-mono text-micro uppercase text-ink-500"><Ago at={launch.at} /></span>
        </Link>
      </li>
    ));

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-micro uppercase text-ink-500">Live registry · {liveNetwork.shortName}</span>
      <ul aria-busy={isPending}>{body}</ul>
    </div>
  );
}

function Empty({ children }: { children: string }) {
  return <li className="dashed-slot px-3 py-3 text-small text-ink-500">{children}</li>;
}

/** Mounted only once rows exist (client side), so the prerender never reads the clock. */
function Ago({ at }: { at: number }) {
  const now = useNow(30_000);
  return <>{relativeTime(at, now * 1000)}</>;
}
