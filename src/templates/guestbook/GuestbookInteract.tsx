"use client";

import { useState } from "react";
import { DashedBox, Field, Kicker, NotchCard, Skeleton, TextArea } from "@/components/ui";
import { ActionButton, AddressPill } from "@/components/web3";
import { byteLength, relativeTime } from "@/lib/format";
import { structs, useWallet } from "@/web3";
import { lastPage, useTemplateRead, useTemplateWrite } from "../runtime";
import type { InteractProps } from "../types";
import { guestbook } from "./definition";

type Entry = { signer: string; at: bigint; message: string };
const MAX = 140;

export default function GuestbookInteract({ address, network }: InteractProps) {
  const { address: me } = useWallet();
  const [message, setMessage] = useState("");
  const tx = useTemplateWrite(guestbook, address, network);

  const entries = useTemplateRead(guestbook, address, network, ["entries"], async (c) => {
    const total = Number(await c.getFunction("entryCount")());
    const { from, count } = lastPage(total, 50);
    const page = structs<Entry>(await c.getFunction("getEntries")(from, count));
    return { total, list: page.reverse() };
  });
  const signed = useTemplateRead(guestbook, address, network, ["hasSigned", me], (c) => c.getFunction("hasSigned")(me) as Promise<boolean>, {
    enabled: Boolean(me),
  });

  const bytes = byteLength(message.trim());
  const reason = signed.data ? "This wallet already signed. One signature per wallet." : null;

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <NotchCard label="Sign" tone="paper" className="lg:col-span-5" bodyClassName="p-5 md:p-8">
        <div className="flex flex-col gap-5">
          <Field label="Your message" counter={{ value: bytes, max: MAX }} error={bytes > MAX ? `Keep it under ${MAX} bytes.` : undefined}>
            {({ id, describedBy, invalid }) => (
              <TextArea id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="gm, I was here." disabled={Boolean(reason)} />
            )}
          </Field>
          <ActionButton
            network={network}
            state={tx.state}
            disabledReason={reason}
            disabled={bytes === 0 || bytes > MAX}
            doneLabel="Signed"
            onAction={async () => {
              if (await tx.write("sign", [message.trim()])) setMessage("");
            }}
          >
            Sign the guestbook
          </ActionButton>
        </div>
      </NotchCard>

      <section className="flex flex-col gap-4 lg:col-span-7" aria-label="Guestbook entries">
        <div className="flex items-baseline justify-between">
          <Kicker bullet>The wall</Kicker>
          <span className="font-mono text-mono text-ink-500 tabular-nums">{entries.data ? `${entries.data.total} SIGNED` : ""}</span>
        </div>
        {entries.isLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : entries.data?.list.length ? (
          <ul className="flex flex-col">
            {entries.data.list.map((e, i) => (
              <li key={`${e.signer}-${i}`} className="flex flex-col gap-2 border-b border-ink-900/10 py-4">
                <p className="text-body text-ink-900">{e.message}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <AddressPill address={e.signer} network={network} />
                  <span className="font-mono text-micro uppercase text-ink-500">{relativeTime(e.at)}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <DashedBox className="text-small text-ink-500">No signatures yet. Be the first.</DashedBox>
        )}
      </section>
    </div>
  );
}
