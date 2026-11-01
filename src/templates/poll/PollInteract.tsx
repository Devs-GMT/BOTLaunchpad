"use client";

import { useState } from "react";
import { Kicker, NotchCard, Pill, Skeleton, StatusDot } from "@/components/ui";
import { ActionButton } from "@/components/web3";
import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/format";
import { useWallet } from "@/web3";
import { useTemplateRead, useTemplateWrite } from "../runtime";
import type { InteractProps } from "../types";
import { poll } from "./definition";

export default function PollInteract({ address, network }: InteractProps) {
  const { address: me } = useWallet();
  const [choice, setChoice] = useState<number | null>(null);
  const vote = useTemplateWrite(poll, address, network);
  const close = useTemplateWrite(poll, address, network);

  const data = useTemplateRead(poll, address, network, ["state"], async (c) => {
    const [options, results, endsAt, closed, open, owner] = await Promise.all([
      c.getFunction("getOptions")() as Promise<string[]>,
      c.getFunction("results")() as Promise<bigint[]>,
      c.getFunction("endsAt")() as Promise<bigint>,
      c.getFunction("closed")() as Promise<boolean>,
      c.getFunction("isOpen")() as Promise<boolean>,
      c.getFunction("owner")() as Promise<string>,
    ]);
    return { options, results: results.map(Number), endsAt: Number(endsAt), closed, open, owner };
  });
  const voted = useTemplateRead(poll, address, network, ["hasVoted", me], (c) => c.getFunction("hasVoted")(me) as Promise<boolean>, {
    enabled: Boolean(me),
  });

  if (data.isLoading || !data.data) return <Skeleton className="h-80 w-full" />;
  const d = data.data;
  const total = d.results.reduce((a, b) => a + b, 0);
  const max = Math.max(...d.results);
  const isOwner = me?.toLowerCase() === d.owner.toLowerCase();

  const reason = !d.open
    ? d.closed
      ? "The owner closed this poll."
      : "This poll has ended."
    : voted.data
      ? "This wallet already voted. One vote per wallet."
      : choice === null
        ? "Pick an option first."
        : null;

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <NotchCard label="Vote" tone="paper" className="lg:col-span-7" bodyClassName="p-5 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            {d.open ? (
              <Pill tone="mint">
                <StatusDot status="live" /> Open · ends {relativeTime(d.endsAt)}
              </Pill>
            ) : (
              <Pill tone="dashed">{d.closed ? "Closed by owner" : `Ended ${relativeTime(d.endsAt)}`}</Pill>
            )}
            <span className="font-mono text-mono text-ink-500 tabular-nums">{total} VOTES</span>
          </div>

          <div role="radiogroup" aria-label="Options" className="flex flex-col gap-2">
            {d.options.map((label, i) => {
              const votes = d.results[i] ?? 0;
              const pct = total ? Math.round((votes / total) * 100) : 0;
              const selected = choice === i;
              const leading = total > 0 && votes === max;
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!d.open || voted.data === true}
                  onClick={() => setChoice(i)}
                  className={cn(
                    "relative flex min-h-13 cursor-pointer items-center justify-between gap-4 overflow-hidden border px-4 text-left transition-colors disabled:cursor-default",
                    selected ? "border-ink-900" : "border-paper-400 hover:border-ink-500/50",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn("absolute inset-y-0 left-0 transition-[width] duration-500 ease-out-quint", selected ? "bg-lilac-200" : leading ? "bg-paper-300" : "bg-paper-200")}
                    style={{ width: `${pct}%` }}
                  />
                  <span className="relative text-body text-ink-900">{label}</span>
                  <span className="relative font-mono text-mono text-ink-700 tabular-nums">
                    {pct}% · {votes}
                  </span>
                </button>
              );
            })}
          </div>

          <ActionButton
            network={network}
            state={vote.state}
            disabledReason={reason}
            doneLabel="Vote counted"
            onAction={() => choice !== null && vote.write("vote", [choice])}
          >
            Cast vote
          </ActionButton>
        </div>
      </NotchCard>

      <aside className="flex flex-col gap-6 lg:col-span-5">
        <Kicker bullet>How this poll works</Kicker>
        <ul className="flex flex-col gap-3 text-small text-ink-500">
          <li>One vote per wallet, counted on-chain. Votes can&apos;t be changed.</li>
          <li>Voting stops at the end time, or earlier if the owner closes it.</li>
          <li>Results are public and update live.</li>
        </ul>
        {isOwner && d.open && (
          <div className="flex flex-col gap-3 border-t border-ink-900/10 pt-6">
            <Kicker>Owner</Kicker>
            <ActionButton network={network} state={close.state} variant="secondary" doneLabel="Poll closed" onAction={() => close.write("close")}>
              Close the poll now
            </ActionButton>
          </div>
        )}
      </aside>
    </div>
  );
}
