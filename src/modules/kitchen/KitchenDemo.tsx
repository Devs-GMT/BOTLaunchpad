"use client";

import { useState } from "react";
import { DotMatrixStack, DotWorldMap, LogoMark, PixelIcon, Watermark, type PixelIconName } from "@/components/graphics";
import {
  Button,
  Chip,
  CopyButton,
  DashedBox,
  DateTimeInput,
  Dialog,
  Field,
  FolderCard,
  Kicker,
  LedgerRow,
  LinkButton,
  ListInput,
  NotchCard,
  Pill,
  Section,
  SegmentedControl,
  Skeleton,
  StatusDot,
  Stepper,
  Tabs,
  TextArea,
  TextInput,
  Toggle,
  TwoToneHeading,
} from "@/components/ui";
import { byteLength } from "@/lib/format";

const icons: PixelIconName[] = ["key", "shield", "lock", "check", "wallet", "code", "map"];

export function KitchenDemo() {
  const [options, setOptions] = useState(["Chips", "Fruit"]);
  const [net, setNet] = useState<"mainnet" | "testnet">("testnet");
  const [open, setOpen] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [message, setMessage] = useState("gm from the booth");
  const [tick, setTick] = useState(0);

  return (
    <main className="pt-24">
      <Section>
        <Kicker bullet>Kitchen · dev only</Kicker>
        <TwoToneHeading as="h1" size="hero" lines={["Your first contract", "is one click", "away."]} className="mt-6" />
        <p className="mt-6 max-w-prose text-body-lg text-ink-500">
          Pick a template, fill a short form, confirm in MetaMask. A real smart contract on BOT Chain, owned by you.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton href="/launch" size="lg" trailingArrow>
            Launch a contract
          </LinkButton>
          <Button variant="secondary" size="lg">
            See how it works
          </Button>
          <Button variant="ghost" size="lg">
            Ghost
          </Button>
          <Button variant="lilac" size="lg">
            Lilac
          </Button>
          <Button size="lg" disabled>
            Disabled
          </Button>
          <LinkButton href="https://scan.botchain.ai" external variant="secondary" size="lg">
            View on explorer
          </LinkButton>
        </div>
      </Section>

      <Section tone="soft">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <TwoToneHeading lines={["Remix shows you how.", "Launchpad does it for you."]} />
            <div className="flex flex-wrap items-center gap-3">
              <Chip label="Poll.sol" meta="2 fns" />
              <Chip tone="lilac" label="Your contract" meta="just now" />
              <Chip label={<span className="inline-flex items-center gap-2"><StatusDot status="old" /> Old way</span>} />
              <Chip label={<span className="inline-flex items-center gap-2"><StatusDot status="live" pulse /> Live</span>} />
              <Pill tone="lilac">Steps: 3</Pill>
              <Pill>Steps: 8</Pill>
              <Pill tone="ink">Mainnet</Pill>
              <Pill tone="mint">Listed</Pill>
            </div>
            <div className="flex gap-3">
              <DashedBox size="chip">Solidity</DashedBox>
              <DashedBox size="chip">ethers.js</DashedBox>
              <DashedBox size="chip">MetaMask</DashedBox>
            </div>
            <div>
              <LedgerRow left={<><StatusDot status="live" /> Poll · Best snack?</>} right="POLL · JUST NOW" href="#" />
              <LedgerRow left="Guestbook · Devcon booth" right="3M AGO" />
              <LedgerRow left="Registry" right={<span className="inline-flex items-center gap-1">0x12ab…9f3c <CopyButton value="0x12ab" /></span>} />
              <LedgerRow left="Loading" right={<Skeleton className="w-20" />} />
            </div>
            <div className="flex flex-wrap items-end gap-6 text-ink-900">
              <LogoMark size={28} />
              {icons.map((n) => (
                <PixelIcon key={n} name={n} cell={4} title={n} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <button type="button" className="cursor-pointer text-left" onClick={() => setTick((t) => t + 1)}>
              <DotMatrixStack tick={tick} />
              <Kicker className="mt-2">Click to replay the block flash · tick {tick}</Kicker>
            </button>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          <FolderCard tab={<Chip label="Guestbook.sol" meta="1 fn" />} media={<div className="pixel-grid flex h-40 items-center justify-center bg-paper-200"><PixelIcon name="code" cell={6} /></div>}>
            <Kicker bullet>Community</Kicker>
            <p className="mt-3 text-h3">Guestbook</p>
            <p className="mt-2 text-small text-ink-500">Event guestbook, &ldquo;I was here&rdquo;.</p>
          </FolderCard>
          <FolderCard tone="lilac" tab={<Kicker>Launchpad</Kicker>}>
            <p className="text-h3">Launching with a template.</p>
            <p className="mt-2 text-small text-ink-700">Lilac folder = yours.</p>
          </FolderCard>
          <FolderCard tone="soft" tab={<Kicker>Remix</Kicker>}>
            <p className="text-h3">Deploying by hand.</p>
          </FolderCard>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <NotchCard label="Review" tone="paper">
            <Tabs
              items={[
                {
                  id: "form",
                  label: "Summary",
                  content: (
                    <div className="flex flex-col gap-6">
                      <Field label="Question" hint="What people vote on." counter={{ value: byteLength(message), max: 120 }}>
                        {({ id, describedBy, invalid }) => (
                          <TextInput id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} value={message} onChange={(e) => setMessage(e.target.value)} />
                        )}
                      </Field>
                      <Field label="Options" error={options.some((o) => !o) ? "Every option needs a label." : undefined}>
                        {({ id, describedBy }) => (
                          <ListInput id={id} describedBy={describedBy} values={options} onChange={setOptions} min={2} max={6} placeholder={(i) => `Option ${i + 1}`} />
                        )}
                      </Field>
                      <Field label="Ends on">{({ id }) => <DateTimeInput id={id} />}</Field>
                      <Field label="Thank-you message" error="Too long: 141/140 bytes.">
                        {({ id, describedBy, invalid }) => <TextArea id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} />}
                      </Field>
                      <Field label="Who can add tasks">
                        {({ id }) => (
                          <SegmentedControl id={id} aria-label="Network" value={net} onChange={setNet} options={[{ value: "mainnet", label: "Only me" }, { value: "testnet", label: "Anyone", hint: "open board" }]} />
                        )}
                      </Field>
                      <Toggle checked={open} onChange={setOpen} label="Open to everyone" />
                    </div>
                  ),
                },
                { id: "code", label: "View code", content: <pre className="overflow-x-auto bg-coal-900 p-4 font-mono text-mono text-paper-50">contract Poll {"{ … }"}</pre> },
                { id: "net", label: "Network", content: <p className="text-small text-ink-500">Try Testnet first — it&apos;s free.</p> },
              ]}
            />
          </NotchCard>
          <div className="flex flex-col gap-8">
            <Stepper
              steps={[
                { label: "Waiting for confirmation", status: "done" },
                { label: "Deploying…", status: "current", detail: "tx 0x9a3f…11be ↗" },
                { label: "Live at 0xAB…", status: "upcoming" },
                { label: "Listed in the feed", status: "error", detail: "Rejected in wallet" },
              ]}
            />
            <Stepper orientation="horizontal" steps={[{ label: "Fill", status: "done" }, { label: "Review", status: "current" }, { label: "Launch", status: "upcoming" }, { label: "List", status: "upcoming" }]} />
            <Button variant="secondary" onClick={() => setDialog(true)}>
              Open dialog
            </Button>
            <Dialog open={dialog} onClose={() => setDialog(false)} title="Why two transactions?">
              <p className="text-small text-ink-500">One creates your contract, one lists it in the Launchpad feed.</p>
            </Dialog>
          </div>
        </div>
      </Section>

      <Section tone="coal" grid>
        <NotchCard label="Ownership & Safety">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <TwoToneHeading tone="dark" lines={["Owned by you", "from the first block."]} />
              <p className="mt-6 max-w-prose text-body text-paper-500">Your wallet deploys the contract, so you are its owner from block one.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="teal" trailingArrow>
                  Read the templates
                </Button>
                <Button variant="outline-light">Launch on Mainnet</Button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-8 text-paper-50">
              <PixelIcon name="key" cell={8} accentClassName="fill-teal-300" />
              <PixelIcon name="shield" cell={8} accentClassName="fill-teal-300" />
            </div>
          </div>
        </NotchCard>
        <DotWorldMap className="mt-16" beacons={[{ at: [106.8, -6.2], tone: "teal" }, { at: [103.8, 1.35], tone: "mint" }, { at: [-0.1, 51.5] }]} />
        <Watermark className="mt-16" />
      </Section>
    </main>
  );
}
