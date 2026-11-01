import { getAddress, isAddress } from "ethers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container, Skeleton } from "@/components/ui";
import { networkFromParam } from "@/config/networks";
import { ContractView } from "./ContractView";

type Props = {
  params: Promise<{ address: string }>;
  searchParams: Promise<{ net?: string | string[]; new?: string | string[] }>;
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function contractMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { address } = await params;
  return { title: isAddress(address) ? `Contract ${address.slice(0, 6)}…${address.slice(-4)}` : "Contract" };
}

async function Resolved({ params, searchParams }: Props) {
  const [{ address }, query] = await Promise.all([params, searchParams]);
  if (!isAddress(address)) notFound();
  return (
    <ContractView
      address={getAddress(address) as `0x${string}`}
      network={networkFromParam(first(query.net))}
      fresh={first(query.new) === "1"}
    />
  );
}

export function ContractPage(props: Props) {
  return (
    <main className="pt-28 pb-24 md:pt-36">
      <Container>
        <Suspense
          fallback={
            <div className="flex flex-col gap-6">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-14 w-2/3" />
            </div>
          }
        >
          <Resolved {...props} />
        </Suspense>
      </Container>
    </main>
  );
}
