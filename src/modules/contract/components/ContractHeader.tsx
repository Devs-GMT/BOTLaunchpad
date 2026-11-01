"use client";

import { PixelIcon } from "@/components/graphics";
import { Chip, Kicker, LedgerRow, LinkButton, Pill, StatusDot } from "@/components/ui";
import { AddressPill } from "@/components/web3";
import type { NetworkConfig } from "@/config/networks";
import { addressUrl } from "@/lib/explorer";
import type { Template } from "@/templates";
import type { Launch } from "@/web3";
import { ShareButton } from "./ShareButton";

export interface ContractHeaderProps {
  address: `0x${string}`;
  network: NetworkConfig;
  template: Template;
  name: string;
  owner: `0x${string}`;
  launch: Launch | null;
}

export function ContractHeader({ address, network, template, name, owner, launch }: ContractHeaderProps) {
  const verifyHref = `/c/${address}/verify${network.key === "mainnet" ? "" : `?net=${network.key}`}`;
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
      <div className="flex flex-col gap-5 lg:col-span-7">
        <div className="flex flex-wrap items-center gap-3 text-ink-900">
          <PixelIcon name={template.icon} cell={4} />
          <Kicker bullet>
            {template.title} · {network.shortName}
          </Kicker>
        </div>
        <h1 className="text-h2-sm break-words md:text-h1">{name}</h1>
        <div className="flex flex-wrap gap-3">
          <LinkButton href={addressUrl(network, address)} external variant="secondary" size="sm">
            View on explorer
          </LinkButton>
          <LinkButton href={verifyHref} variant="secondary" size="sm">
            Verify helper
          </LinkButton>
          <ShareButton title={name} />
        </div>
      </div>
      <div className="lg:col-span-5">
        <LedgerRow left="Contract" right={<AddressPill address={address} network={network} markYou={false} />} />
        <LedgerRow left="Owner" right={<AddressPill address={owner} network={network} />} />
        <LedgerRow left="Template" right={<Chip label={template.artifact.fileName} meta={`#${template.id}`} />} />
        <LedgerRow
          left="Network"
          right={
            <span className="inline-flex items-center gap-2">
              <StatusDot status="live" /> {network.name.toUpperCase()}
            </span>
          }
        />
        <LedgerRow left="Launchpad feed" right={launch ? <Pill tone="mint">Listed · #{launch.id}</Pill> : <Pill>Not listed</Pill>} />
      </div>
    </div>
  );
}
