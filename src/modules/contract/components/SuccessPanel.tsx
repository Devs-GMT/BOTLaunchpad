"use client";

import { LogoMark } from "@/components/graphics";
import { CopyButton, Kicker, LinkButton } from "@/components/ui";
import type { NetworkConfig } from "@/config/networks";
import { addressUrl } from "@/lib/explorer";
import { ShareButton } from "./ShareButton";

/** Lilac band after a fresh launch (`?new=1`). Lilac = yours. */
export function SuccessPanel({ address, network, name }: { address: string; network: NetworkConfig; name: string }) {
  return (
    <div className="flex flex-col gap-6 border border-lilac-400 bg-lilac-200 p-6 md:flex-row md:items-center md:justify-between md:p-8">
      <div className="flex items-start gap-4">
        <LogoMark size={28} accentClassName="fill-lilac-600" className="mt-1 text-ink-900" />
        <div className="flex flex-col gap-2">
          <Kicker className="text-ink-700">Launched on {network.name}</Kicker>
          <p className="text-h3 text-ink-900">Your contract is live.</p>
          <span className="inline-flex flex-wrap items-center gap-1 font-mono text-mono text-ink-900">
            {address} <CopyButton value={address} />
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <LinkButton href={addressUrl(network, address)} external size="sm">
          View on explorer
        </LinkButton>
        <ShareButton title={name} variant="ghost" />
        <LinkButton href="/launch" variant="ghost" size="sm" trailingArrow>
          Launch another
        </LinkButton>
      </div>
    </div>
  );
}
