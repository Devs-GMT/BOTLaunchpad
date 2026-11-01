"use client";

import { useQuery } from "@tanstack/react-query";
import { Contract } from "ethers";
import { networks, type NetworkConfig } from "@/config/networks";
import { codeHashes, templateById } from "./index";
import type { Template } from "./types";
import { getLaunchByAddress, hasRegistry, lookupCode, readProvider, type Launch } from "@/web3";

export type Resolved =
  | { kind: "template"; template: Template; launch: Launch | null; name: string; owner: `0x${string}` }
  | { kind: "other-network"; network: NetworkConfig }
  | { kind: "no-code" }
  | { kind: "not-launchpad" };

async function resolve(address: string, network: NetworkConfig): Promise<Resolved> {
  // 1) Listed in the registry: trusted template id + feed name.
  const launch = hasRegistry(network) ? await getLaunchByAddress(network, address) : null;
  let templateId = launch?.templateId;

  // 2) Not listed: identify by runtime code hash.
  if (!templateId) {
    const code = await lookupCode(network, address, codeHashes);
    if (code.kind === "match") templateId = code.templateId;
    else if (code.kind === "unknown-code") return { kind: "not-launchpad" };
    else {
      const other = network.key === "mainnet" ? networks.testnet : networks.mainnet;
      const there = await lookupCode(other, address, codeHashes).catch(() => null);
      return there?.kind === "match" ? { kind: "other-network", network: other } : { kind: "no-code" };
    }
  }

  const template = templateById(templateId);
  if (!template) return { kind: "not-launchpad" };
  const c = new Contract(address, template.artifact.abi, readProvider(network));
  const [name, owner] = await Promise.all([c.getFunction("name")() as Promise<string>, c.getFunction("owner")() as Promise<string>]);
  return { kind: "template", template, launch, name, owner: owner as `0x${string}` };
}

export function useResolveContract(address: string, network: NetworkConfig) {
  return useQuery({
    queryKey: ["resolve", network.chainId, address.toLowerCase()] as const,
    queryFn: () => resolve(address, network),
    staleTime: 60_000,
  });
}
