"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Contract, Interface, type ContractTransactionResponse, type Overrides } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { NetworkConfig } from "@/config/networks";
import { readProvider, useTxFlow, useWallet } from "@/web3";
import type { TemplateArtifact } from "./types";

/** The parts of a template the runtime needs (keeps schema generics out of the way). */
export type RuntimeTemplate = { artifact: TemplateArtifact; errors: Record<string, string> };

const contractKey = (network: NetworkConfig, address: string) => ["contract", network.chainId, address.toLowerCase()] as const;

/** A read against a deployed template, cached and refreshed every 12 s and after every write. */
export function useTemplateRead<T>(
  template: RuntimeTemplate,
  address: string,
  network: NetworkConfig,
  key: readonly unknown[],
  read: (contract: Contract) => Promise<T>,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: [...contractKey(network, address), ...key],
    queryFn: () => read(new Contract(address, template.artifact.abi, readProvider(network))),
    refetchInterval: 12_000,
    enabled: options.enabled ?? true,
  });
}

/** Writes to a deployed template through the shared tx state machine; refetches its reads on success. */
export function useTemplateWrite(template: RuntimeTemplate, address: string, network: NetworkConfig) {
  const { getSigner } = useWallet();
  const queryClient = useQueryClient();
  const abi = useMemo(() => [new Interface(template.artifact.abi)], [template]);
  const flow = useTxFlow({
    abi,
    errors: template.errors,
    onConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: contractKey(network, address) });
      queryClient.invalidateQueries({ queryKey: ["balance", network.chainId] });
    },
  });
  const { send } = flow;

  const write = useCallback(
    (fn: string, args: unknown[] = [], overrides?: Overrides & { value?: bigint }) =>
      send(async () => {
        const contract = new Contract(address, template.artifact.abi, await getSigner());
        const call = contract.getFunction(fn);
        return (await (overrides ? call(...args, overrides) : call(...args))) as ContractTransactionResponse;
      }),
    [send, getSigner, address, template],
  );

  return { ...flow, write };
}

/** Newest-first page bounds for `getX(from, count)` style views. */
export function lastPage(total: number, size: number) {
  const from = Math.max(0, total - size);
  return { from, count: total - from };
}

/** Unix seconds, refreshed every `everyMs` so time-based states (opens in…, ended) update on their own. */
export function useNow(everyMs = 15_000) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), everyMs);
    return () => clearInterval(t);
  }, [everyMs]);
  return now;
}
