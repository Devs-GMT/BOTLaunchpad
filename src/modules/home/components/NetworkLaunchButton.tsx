"use client";

import { LinkButton, type LinkButtonProps } from "@/components/ui";
import type { NetworkKey } from "@/config/networks";
import { useSelectedNetwork } from "@/web3";

/** Link to the template picker that preselects a network first. */
export function NetworkLaunchButton({ network, ...props }: Omit<LinkButtonProps, "href"> & { network: NetworkKey }) {
  const [, setNetwork] = useSelectedNetwork();
  return <LinkButton href="/launch" onClick={() => setNetwork(network)} {...props} />;
}
