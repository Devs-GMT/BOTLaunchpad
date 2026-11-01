"use client";

import { LedgerRow, LinkButton, Skeleton, StatusDot } from "@/components/ui";
import type { NetworkConfig } from "@/config/networks";
import { external } from "@/config/site";
import { formatBOT } from "@/lib/format";
import type { Template } from "@/templates";
import { hasRegistry, useBalance, useWallet } from "@/web3";
import { useDeployEstimate } from "../hooks/useDeployEstimate";

export interface GasLineProps {
  template: Template;
  args: unknown[];
  network: NetworkConfig;
}

/** Cost of both transactions, plus a balance check when a wallet is connected. */
export function GasLine({ template, args, network }: GasLineProps) {
  const { address, chainId } = useWallet();
  const estimate = useDeployEstimate(template, args, network, address);
  const balance = useBalance(network, chainId === network.chainId ? address : null);
  const listing = hasRegistry(network);
  const total =
    estimate.deployCost !== undefined && estimate.registerCost !== undefined
      ? estimate.deployCost + (listing ? estimate.registerCost : 0n)
      : undefined;
  const short = balance.data !== undefined && total !== undefined && balance.data < total;

  const cost = (v: bigint | undefined) => (v === undefined ? <Skeleton className="w-20" /> : `~${formatBOT(v)}`);

  return (
    <div className="flex flex-col">
      <LedgerRow left="1 · Create your contract" right={cost(estimate.deployCost)} />
      {listing && <LedgerRow left="2 · List it in the feed (optional)" right={cost(estimate.registerCost)} />}
      {balance.data !== undefined && (
        <LedgerRow
          left={
            <>
              <StatusDot status={short ? "old" : "live"} /> Your balance on {network.shortName}
            </>
          }
          right={formatBOT(balance.data)}
        />
      )}
      <p className="mt-3 text-small text-ink-500">
        Gas only. No fees, no approvals. Estimated at {estimate.gasPrice ? `${Number(estimate.gasPrice) / 1e9} gwei` : "the current gas price"}
        {estimate.isFallback ? " from the compiled size" : ""}.
      </p>
      {short && (
        <div className="mt-4 flex flex-col gap-3 border border-ember-500/40 bg-ember-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-small text-ink-900">Not enough BOT for gas. You need about {total !== undefined ? formatBOT(total) : "a little more"}.</p>
          {network.faucetUrl ? (
            <LinkButton href={network.faucetUrl} external size="sm" variant="secondary">
              Get free testnet BOT
            </LinkButton>
          ) : (
            <LinkButton href={external.botchain} external size="sm" variant="secondary">
              Get BOT for gas
            </LinkButton>
          )}
        </div>
      )}
    </div>
  );
}
