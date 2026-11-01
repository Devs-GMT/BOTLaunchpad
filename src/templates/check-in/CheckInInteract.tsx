"use client";

import { DashedBox, Kicker, LedgerRow, NotchCard, Pill, Skeleton, StatusDot } from "@/components/ui";
import { ActionButton, AddressPill } from "@/components/web3";
import { formatNumber, relativeTime } from "@/lib/format";
import { structs, useWallet } from "@/web3";
import { useNow } from "@/lib/useNow";
import { lastPage, useTemplateRead, useTemplateWrite } from "../runtime";
import type { InteractProps } from "../types";
import { checkIn } from "./definition";

type Attendee = { who: string; at: bigint };

function when(unix: number) {
  return new Date(unix * 1000).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

export default function CheckInInteract({ address, network }: InteractProps) {
  const { address: me } = useWallet();
  const tx = useTemplateWrite(checkIn, address, network);
  const now = useNow();

  const data = useTemplateRead(checkIn, address, network, ["event"], async (c) => {
    const [startsAt, endsAt, max, count] = await Promise.all([
      c.getFunction("startsAt")() as Promise<bigint>,
      c.getFunction("endsAt")() as Promise<bigint>,
      c.getFunction("maxAttendees")() as Promise<bigint>,
      c.getFunction("count")() as Promise<bigint>,
    ]);
    const { from, count: n } = lastPage(Number(count), 50);
    const list = structs<Attendee>(await c.getFunction("attendees")(from, n));
    return { startsAt: Number(startsAt), endsAt: Number(endsAt), max: Number(max), count: Number(count), list: list.reverse() };
  });
  const mine = useTemplateRead(checkIn, address, network, ["checkedIn", me], (c) => c.getFunction("checkedIn")(me) as Promise<boolean>, {
    enabled: Boolean(me),
  });

  if (data.isLoading || !data.data) return <Skeleton className="h-80 w-full" />;
  const d = data.data;
  const phase = now < d.startsAt ? "before" : now >= d.endsAt ? "after" : d.count >= d.max ? "full" : "open";
  const pct = Math.min(100, Math.round((d.count / d.max) * 100));

  const reason = mine.data
    ? "You're checked in. See you there."
    : phase === "before"
      ? `Check-in opens ${relativeTime(d.startsAt)}.`
      : phase === "after"
        ? "Check-in has closed."
        : phase === "full"
          ? "This event is full."
          : null;

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <NotchCard label="Check in" tone="paper" className="lg:col-span-5" bodyClassName="p-5 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            {phase === "open" ? (
              <Pill tone="mint">
                <StatusDot status="live" /> Open now
              </Pill>
            ) : (
              <Pill tone="dashed">{phase === "before" ? "Not open yet" : phase === "full" ? "Full" : "Closed"}</Pill>
            )}
            {mine.data && <Pill tone="lilac">You&apos;re in</Pill>}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-h3 tabular-nums">
                {formatNumber(d.count)}
                <span className="text-ink-500"> / {formatNumber(d.max)}</span>
              </span>
              <span className="font-mono text-mono text-ink-500">{pct}%</span>
            </div>
            <div className="h-2 w-full bg-paper-300" role="meter" aria-valuemin={0} aria-valuemax={d.max} aria-valuenow={d.count} aria-label="Attendees">
              <div className="h-full bg-ink-900 transition-[width] duration-500 ease-out-quint" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div>
            <LedgerRow left="Opens" right={when(d.startsAt)} />
            <LedgerRow left="Closes" right={when(d.endsAt)} />
          </div>
          <ActionButton network={network} state={tx.state} size="lg" disabledReason={reason} doneLabel="Checked in" onAction={() => tx.write("checkIn")}>
            Check in
          </ActionButton>
        </div>
      </NotchCard>

      <section className="flex flex-col gap-4 lg:col-span-7" aria-label="Attendees">
        <div className="flex items-baseline justify-between">
          <Kicker bullet>Attendees</Kicker>
          <span className="font-mono text-mono text-ink-500 tabular-nums">{d.count} CHECKED IN</span>
        </div>
        {d.list.length ? (
          <ul>
            {d.list.map((a, i) => (
              <LedgerRow key={a.who} left={<><span className="font-mono text-micro text-ink-500 tabular-nums">{String(d.count - i).padStart(3, "0")}</span><AddressPill address={a.who} network={network} /></>} right={relativeTime(a.at).toUpperCase()} />
            ))}
          </ul>
        ) : (
          <DashedBox className="text-small text-ink-500">Nobody has checked in yet.</DashedBox>
        )}
      </section>
    </div>
  );
}
