"use client";

import { Skeleton } from "@/components/ui";
import { formatBOT } from "@/lib/format";
import { allTemplates } from "@/templates";
import { useGasPrice } from "@/web3";
import { liveNetwork } from "@/config/addresses";

const gas = allTemplates.map((t) => BigInt(t.artifact.deployGas));
const min = gas.reduce((a, b) => (b < a ? b : a));
const max = gas.reduce((a, b) => (b > a ? b : a));

/** "0.0101–0.0152 BOT": the measured deploy gas of the cheapest and priciest template at today's gas price. */
export function LaunchCostRange() {
  const { data: price } = useGasPrice(liveNetwork);
  if (price === undefined) return <Skeleton className="h-3 w-28" />;
  return (
    <>
      {formatBOT(min * price).replace(" BOT", "")}–{formatBOT(max * price)}
    </>
  );
}
