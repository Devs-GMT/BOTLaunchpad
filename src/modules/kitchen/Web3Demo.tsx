"use client";

import { Kicker, LedgerRow, Skeleton, StatusDot } from "@/components/ui";
import { ConnectButton } from "@/components/web3";
import { networkList, type NetworkConfig } from "@/config/networks";
import { formatNumber } from "@/lib/format";
import { hasRegistry, useBlockNumber, useWallet } from "@/web3";

function BlockRow({ network }: { network: NetworkConfig }) {
  const { data, isError } = useBlockNumber(network);
  return (
    <LedgerRow
      left={
        <>
          <StatusDot status={isError ? "idle" : "live"} pulse={!isError} /> {network.name}
          <span className="font-mono text-micro text-ink-500">CHAIN {network.chainId}</span>
        </>
      }
      right={isError ? "RPC NOT RESPONDING" : data === undefined ? <Skeleton className="w-24" /> : `BLOCK #${formatNumber(data)}`}
    />
  );
}

export function Web3Demo() {
  const wallet = useWallet();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Kicker bullet>Web3 · live</Kicker>
        <ConnectButton />
      </div>
      {networkList.map((n) => (
        <BlockRow key={n.key} network={n} />
      ))}
      <LedgerRow left="Wallet status" right={`${wallet.status.toUpperCase()}${wallet.network ? ` · ${wallet.network.shortName}` : ""}`} />
      <LedgerRow left="Registry deployed" right={networkList.map((n) => `${n.shortName}: ${hasRegistry(n) ? "yes" : "no"}`).join(" · ")} />
    </div>
  );
}
