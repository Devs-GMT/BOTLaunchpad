import { PixelIcon } from "@/components/graphics";
import { Kicker, LinkButton, TwoToneHeading } from "@/components/ui";
import type { NetworkConfig } from "@/config/networks";
import { addressUrl, contractHref } from "@/lib/explorer";

export type NotLaunchpadReason = "not-launchpad" | "no-code" | "other-network";

const copy: Record<NotLaunchpadReason, readonly [string, string]> = {
  "not-launchpad": ["This isn't a Launchpad contract.", "Its code doesn't match any template."],
  "no-code": ["Nothing is deployed here.", "No contract at this address on this network."],
  "other-network": ["Wrong network.", "This contract lives on the other BOT Chain network."],
};

export function NotLaunchpad({ reason, address, network, otherNetwork }: { reason: NotLaunchpadReason; address: string; network: NetworkConfig; otherNetwork?: NetworkConfig }) {
  return (
    <div className="flex flex-col items-start gap-6 py-10">
      <PixelIcon name="map" cell={6} className="text-ink-900" />
      <Kicker bullet>
        {network.name} · {address.slice(0, 10)}…
      </Kicker>
      <TwoToneHeading as="h1" size="h1" lines={copy[reason]} />
      <div className="flex flex-wrap gap-3">
        {reason === "other-network" && otherNetwork && (
          <LinkButton href={contractHref(address, otherNetwork)} trailingArrow>
            Open on {otherNetwork.name}
          </LinkButton>
        )}
        <LinkButton href={addressUrl(network, address)} external variant="secondary">
          Check on the explorer
        </LinkButton>
        <LinkButton href="/launch" variant="ghost" trailingArrow>
          Launch your own
        </LinkButton>
      </div>
    </div>
  );
}
