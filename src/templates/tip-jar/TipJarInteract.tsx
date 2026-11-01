"use client";

import { parseEther } from "ethers";
import { useState } from "react";
import { DashedBox, Field, Kicker, LedgerRow, NotchCard, NumberInput, Skeleton, TextInput } from "@/components/ui";
import { ActionButton, AddressPill } from "@/components/web3";
import { byteLength, formatBOT, relativeTime } from "@/lib/format";
import { structs, useWallet } from "@/web3";
import { lastPage, useTemplateRead, useTemplateWrite } from "../runtime";
import type { InteractProps } from "../types";
import { tipJar } from "./definition";

type Tip = { from: string; amount: bigint; at: bigint; note: string };
const MIN = parseEther("0.001");
const MAX_NOTE = 140;

function parseAmount(v: string): bigint | null {
  try {
    return v.trim() ? parseEther(v.trim()) : null;
  } catch {
    return null;
  }
}

export default function TipJarInteract({ address, network }: InteractProps) {
  const { address: me } = useWallet();
  const [amount, setAmount] = useState("0.01");
  const [note, setNote] = useState("");
  const tip = useTemplateWrite(tipJar, address, network);
  const withdraw = useTemplateWrite(tipJar, address, network);

  const data = useTemplateRead(tipJar, address, network, ["jar"], async (c) => {
    const [owner, thankYou, total, balance, count] = await Promise.all([
      c.getFunction("owner")() as Promise<string>,
      c.getFunction("thankYou")() as Promise<string>,
      c.getFunction("totalTipped")() as Promise<bigint>,
      c.getFunction("balance")() as Promise<bigint>,
      c.getFunction("tipCount")() as Promise<bigint>,
    ]);
    const { from, count: n } = lastPage(Number(count), 30);
    const tips = structs<Tip>(await c.getFunction("getTips")(from, n));
    return { owner, thankYou, total, balance, count: Number(count), tips: tips.reverse() };
  });

  if (data.isLoading || !data.data) return <Skeleton className="h-80 w-full" />;
  const d = data.data;
  const isOwner = me?.toLowerCase() === d.owner.toLowerCase();
  const wei = parseAmount(amount);
  const amountError = amount.trim() && wei === null ? "Enter an amount like 0.01." : wei !== null && wei < MIN ? "The minimum tip is 0.001 BOT." : undefined;
  const noteBytes = byteLength(note.trim());

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <NotchCard label="Send a tip" tone="paper" className="lg:col-span-5" bodyClassName="p-5 md:p-8">
        <div className="flex flex-col gap-5">
          {d.thankYou && <blockquote className="border-l-2 border-lilac-400 pl-4 text-body text-ink-700">“{d.thankYou}”</blockquote>}
          <Field label="Amount (BOT)" hint="Minimum 0.001 BOT. Goes to the jar, which only the owner can withdraw." error={amountError}>
            {({ id, describedBy, invalid }) => (
              <NumberInput id={id} min={0.001} step={0.001} aria-describedby={describedBy} aria-invalid={invalid || undefined} value={amount} onChange={(e) => setAmount(e.target.value)} />
            )}
          </Field>
          <Field label="Note (optional)" counter={{ value: noteBytes, max: MAX_NOTE }} error={noteBytes > MAX_NOTE ? `Keep it under ${MAX_NOTE} bytes.` : undefined}>
            {({ id, describedBy, invalid }) => (
              <TextInput id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Love your work" />
            )}
          </Field>
          <ActionButton
            network={network}
            state={tip.state}
            disabled={wei === null || Boolean(amountError) || noteBytes > MAX_NOTE}
            doneLabel="Tip sent"
            onAction={async () => {
              if (wei !== null && (await tip.write("tip", [note.trim()], { value: wei }))) setNote("");
            }}
          >
            Send {wei !== null && !amountError ? formatBOT(wei) : "tip"}
          </ActionButton>
        </div>
      </NotchCard>

      <section className="flex flex-col gap-6 lg:col-span-7" aria-label="Tips">
        <div>
          <LedgerRow left="Total tipped" right={formatBOT(d.total)} />
          <LedgerRow left="In the jar now" right={formatBOT(d.balance)} />
          <LedgerRow left="Tips" right={d.count} />
        </div>
        {isOwner && (
          <div className="flex flex-col gap-3 border border-lilac-400 bg-lilac-100 p-5">
            <Kicker>You own this jar</Kicker>
            <ActionButton
              network={network}
              state={withdraw.state}
              variant="primary"
              disabledReason={d.balance === 0n ? "Nothing to withdraw yet." : null}
              doneLabel="Withdrawn to your wallet"
              onAction={() => withdraw.write("withdraw")}
            >
              Withdraw {formatBOT(d.balance)}
            </ActionButton>
          </div>
        )}
        <Kicker bullet>Recent tips</Kicker>
        {d.tips.length ? (
          <ul className="flex flex-col">
            {d.tips.map((t, i) => (
              <li key={i} className="flex flex-col gap-2 border-b border-ink-900/10 py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-mono text-mono text-ink-900 tabular-nums">{formatBOT(t.amount)}</span>
                  <span className="font-mono text-micro uppercase text-ink-500">{relativeTime(t.at)}</span>
                </div>
                {t.note && <p className="text-body text-ink-700">{t.note}</p>}
                <AddressPill address={t.from} network={network} />
              </li>
            ))}
          </ul>
        ) : (
          <DashedBox className="text-small text-ink-500">No tips yet.</DashedBox>
        )}
      </section>
    </div>
  );
}
