"use client";

import Link from "next/link";
import { PixelIcon } from "@/components/graphics";
import { ArrowRight, Chip, DashedBox, Kicker, LinkButton, Pill, SegmentedControl, Skeleton, TwoToneHeading } from "@/components/ui";
import { RequireWallet } from "@/components/web3";
import type { NetworkConfig } from "@/config/networks";
import { contractHref } from "@/lib/explorer";
import { relativeTime, shortAddress } from "@/lib/format";
import { templateById } from "@/templates";
import { hasRegistry, useLaunchesOf, useSelectedNetwork, useWallet } from "@/web3";
import { usePendingLaunches } from "./hooks/usePendingLaunches";

const networkOptions = [
  { value: "testnet", label: "Testnet" },
  { value: "mainnet", label: "Mainnet" },
] as const;

function Row({ href, templateId, name, address, meta, badge }: { href: string; templateId: number; name: string; address: string; meta: string; badge: React.ReactNode }) {
  const template = templateById(templateId);
  return (
    <li>
      <Link href={href} className="group flex items-center gap-4 border-b border-ink-900/10 py-4 transition-colors hover:bg-ink-900/3">
        <span className="flex size-12 shrink-0 items-center justify-center border border-ink-900/10 bg-paper-200 text-ink-900">
          {template && <PixelIcon name={template.icon} cell={3} />}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-body text-ink-900">{name}</span>
          <span className="flex flex-wrap items-center gap-2">
            {template && <Chip label={template.artifact.fileName} />}
            <span className="font-mono text-micro text-ink-500">{shortAddress(address)}</span>
          </span>
        </span>
        <span className="hidden flex-col items-end gap-1 sm:flex">
          {badge}
          <span className="font-mono text-micro uppercase text-ink-500">{meta}</span>
        </span>
        <ArrowRight className="shrink-0 text-ink-500 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}

function Lists({ network, owner }: { network: NetworkConfig; owner: string }) {
  const listed = useLaunchesOf(network, owner);
  const pending = usePendingLaunches(network.chainId);
  const listedSet = new Set((listed.data ?? []).map((l) => l.contractAddr.toLowerCase()));
  const notListed = pending.filter((p) => p.owner.toLowerCase() === owner.toLowerCase() && !listedSet.has(p.address.toLowerCase()));

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <section className="flex flex-col gap-4" aria-label="Listed">
        <div className="flex items-baseline justify-between">
          <Kicker bullet>Listed in the feed</Kicker>
          <span className="font-mono text-mono text-ink-500">{listed.data?.length ?? ""}</span>
        </div>
        {!hasRegistry(network) ? (
          <DashedBox className="text-small text-ink-500">The Launchpad feed isn&apos;t live on {network.name} yet.</DashedBox>
        ) : listed.isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : listed.data?.length ? (
          <ul>
            {listed.data.map((l) => (
              <Row key={l.contractAddr} href={contractHref(l.contractAddr, network)} templateId={l.templateId} name={l.name} address={l.contractAddr} meta={relativeTime(l.at)} badge={<Pill tone="mint">#{l.id}</Pill>} />
            ))}
          </ul>
        ) : (
          <DashedBox className="flex flex-col items-start gap-4 text-small text-ink-500">
            Nothing listed from this wallet on {network.name} yet.
            <LinkButton href="/launch" size="sm" trailingArrow>
              Launch a contract
            </LinkButton>
          </DashedBox>
        )}
      </section>

      <section className="flex flex-col gap-4" aria-label="Not listed yet">
        <div className="flex items-baseline justify-between">
          <Kicker bullet>Not listed yet · this browser</Kicker>
          <span className="font-mono text-mono text-ink-500">{notListed.length || ""}</span>
        </div>
        {notListed.length ? (
          <ul>
            {notListed.map((p) => (
              <Row
                key={p.address}
                href={contractHref(p.address, network)}
                templateId={p.templateId}
                name={p.name || "Untitled"}
                address={p.address}
                meta={relativeTime(Math.floor(p.at / 1000))}
                badge={<Pill tone="lilac">Register now</Pill>}
              />
            ))}
          </ul>
        ) : (
          <DashedBox className="text-small text-ink-500">Every contract you launched from this browser is listed.</DashedBox>
        )}
        <p className="text-small text-ink-500">Deploys you skipped listing are remembered here, in this browser only. Open one to list it.</p>
      </section>
    </div>
  );
}

export function MyLaunchesView() {
  const [network, setNetwork] = useSelectedNetwork();
  const { address } = useWallet();

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-5">
          <Kicker bullet>My launches</Kicker>
          <TwoToneHeading as="h1" size="h1" lines={["Everything you launched.", "Owned by your wallet."]} />
        </div>
        <div className="w-full max-w-xs">
          <SegmentedControl aria-label="Network" options={networkOptions} value={network.key} onChange={setNetwork} />
        </div>
      </div>
      <RequireWallet network={network} size="lg">
        {address && <Lists network={network} owner={address} />}
      </RequireWallet>
    </div>
  );
}
