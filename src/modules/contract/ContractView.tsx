"use client";

import { Skeleton } from "@/components/ui";
import type { NetworkConfig } from "@/config/networks";
import { interactBySlug } from "@/templates/interact";
import { hasRegistry, useWallet } from "@/web3";
import { ContractHeader } from "./components/ContractHeader";
import { NotLaunchpad } from "./components/NotLaunchpad";
import { RegisterNow } from "./components/RegisterNow";
import { SuccessPanel } from "./components/SuccessPanel";
import { useResolveContract } from "@/templates/resolve";

export interface ContractViewProps {
  address: `0x${string}`;
  network: NetworkConfig;
  fresh: boolean;
}

export function ContractView({ address, network, fresh }: ContractViewProps) {
  const { address: me } = useWallet();
  const resolved = useResolveContract(address, network);

  if (resolved.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-14 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (resolved.isError || !resolved.data) {
    return <p className="py-10 text-body text-danger-600">Couldn&apos;t reach {network.name}. Check your connection and refresh.</p>;
  }

  const r = resolved.data;
  if (r.kind !== "template") {
    return <NotLaunchpad reason={r.kind} address={address} network={network} otherNetwork={r.kind === "other-network" ? r.network : undefined} />;
  }

  const Interact = interactBySlug[r.template.slug];
  const isOwner = me?.toLowerCase() === r.owner.toLowerCase();
  const showRegister = !r.launch && isOwner && hasRegistry(network);

  return (
    <div className="flex flex-col gap-12">
      {fresh && <SuccessPanel address={address} network={network} name={r.name} />}
      <ContractHeader address={address} network={network} template={r.template} name={r.name} owner={r.owner} launch={r.launch} />
      {showRegister && <RegisterNow address={address} network={network} template={r.template} name={r.name} />}
      <div className="border-t border-ink-900/10 pt-12">
        <Interact address={address} network={network} feedName={r.launch?.name} />
      </div>
    </div>
  );
}
