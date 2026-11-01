"use client";

import { Skeleton } from "@/components/ui";
import { formatBOT } from "@/lib/format";
import { useGasPrice, useSelectedNetwork } from "@/web3";

/** "~0.0126 BOT" for a gas amount on the selected network. */
export function EstimatedCost({ gas }: { gas: number | bigint }) {
  const [network] = useSelectedNetwork();
  const { data: price } = useGasPrice(network);
  if (price === undefined) return <Skeleton className="h-3 w-16" />;
  return <>~{formatBOT(BigInt(gas) * price)}</>;
}
