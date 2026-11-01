"use client";

import { useState } from "react";
import { CheckIcon, DashedBox, Field, Kicker, NotchCard, Pill, Skeleton, TextInput } from "@/components/ui";
import { ActionButton, AddressPill, TxStatus } from "@/components/web3";
import { cn } from "@/lib/cn";
import { byteLength } from "@/lib/format";
import { structs, useWallet } from "@/web3";
import { useTemplateRead, useTemplateWrite } from "../runtime";
import type { InteractProps } from "../types";
import { todo } from "./definition";

type Task = { creator: string; done: boolean; at: bigint; text: string };
const MAX = 120;

export default function TodoInteract({ address, network }: InteractProps) {
  const { address: me, status, chainId } = useWallet();
  const [text, setText] = useState("");
  const add = useTemplateWrite(todo, address, network);
  const toggle = useTemplateWrite(todo, address, network);
  const [toggling, setToggling] = useState<number | null>(null);

  const data = useTemplateRead(todo, address, network, ["board"], async (c) => {
    const [owner, openToAll, total] = await Promise.all([
      c.getFunction("owner")() as Promise<string>,
      c.getFunction("openToAll")() as Promise<boolean>,
      c.getFunction("taskCount")() as Promise<bigint>,
    ]);
    const tasks = structs<Task>(await c.getFunction("getTasks")(0, 200));
    return { owner, openToAll, total: Number(total), tasks };
  });

  if (data.isLoading || !data.data) return <Skeleton className="h-80 w-full" />;
  const d = data.data;
  const isOwner = me?.toLowerCase() === d.owner.toLowerCase();
  const canAdd = d.openToAll || isOwner;
  const canWrite = status === "connected" && chainId === network.chainId;
  const bytes = byteLength(text.trim());
  const done = d.tasks.filter((t) => t.done).length;

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <section className="flex flex-col gap-4 lg:col-span-7" aria-label="Tasks">
        <div className="flex items-baseline justify-between">
          <Kicker bullet>Tasks</Kicker>
          <span className="font-mono text-mono text-ink-500 tabular-nums">
            {done}/{d.total} DONE
          </span>
        </div>
        {d.tasks.length === 0 ? (
          <DashedBox className="text-small text-ink-500">No tasks yet.</DashedBox>
        ) : (
          <ul className="flex flex-col">
            {d.tasks.map((t, i) => {
              const mayToggle = canWrite && (isOwner || me?.toLowerCase() === t.creator.toLowerCase());
              return (
                <li key={i} className="flex items-start gap-4 border-b border-ink-900/10 py-3.5">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={t.done}
                    aria-label={t.done ? `Mark “${t.text}” not done` : `Mark “${t.text}” done`}
                    disabled={!mayToggle || toggle.isBusy}
                    title={mayToggle ? undefined : "Only the board owner or the task's creator can tick it."}
                    onClick={() => {
                      setToggling(i);
                      toggle.write("toggle", [i]);
                    }}
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 cursor-pointer items-center justify-center border transition-colors disabled:cursor-not-allowed",
                      t.done ? "border-ink-900 bg-ink-900 text-paper-50" : "border-paper-500 bg-paper-0 hover:border-ink-900",
                      toggle.isBusy && toggling === i && "animate-pulse",
                    )}
                  >
                    {t.done && <CheckIcon size={11} />}
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className={cn("text-body", t.done ? "text-ink-500 line-through decoration-ink-500/60" : "text-ink-900")}>{t.text}</span>
                    <AddressPill address={t.creator} network={network} />
                  </div>
                  <span className="font-mono text-micro text-ink-500 tabular-nums">#{String(i + 1).padStart(2, "0")}</span>
                </li>
              );
            })}
          </ul>
        )}
        <TxStatus state={toggle.state} network={network} doneLabel="Task updated" />
      </section>

      <NotchCard label="Add a task" tone="paper" className="lg:col-span-5" bodyClassName="p-5 md:p-8">
        <div className="flex flex-col gap-5">
          <Pill tone={d.openToAll ? "mint" : "dashed"} className="self-start">
            {d.openToAll ? "Anyone can add" : "Only the owner adds"}
          </Pill>
          <Field label="Task" counter={{ value: bytes, max: MAX }} error={bytes > MAX ? `Keep it under ${MAX} bytes.` : undefined}>
            {({ id, describedBy, invalid }) => (
              <TextInput id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ship the demo video" disabled={!canAdd} />
            )}
          </Field>
          <ActionButton
            network={network}
            state={add.state}
            disabledReason={canAdd ? null : "Only the board owner can add tasks here."}
            disabled={bytes === 0 || bytes > MAX}
            doneLabel="Task added"
            onAction={async () => {
              if (await add.write("addTask", [text.trim()])) setText("");
            }}
          >
            Add task
          </ActionButton>
        </div>
      </NotchCard>
    </div>
  );
}
