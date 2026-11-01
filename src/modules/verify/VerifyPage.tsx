import { getAddress, isAddress } from "ethers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container, Skeleton } from "@/components/ui";
import { networkFromParam } from "@/config/networks";
import { VerifyView } from "./VerifyView";

type Props = {
  params: Promise<{ address: string }>;
  searchParams: Promise<{ net?: string | string[] }>;
};

export const verifyMetadata: Metadata = { title: "Verify helper" };

async function Resolved({ params, searchParams }: Props) {
  const [{ address }, query] = await Promise.all([params, searchParams]);
  if (!isAddress(address)) notFound();
  const net = Array.isArray(query.net) ? query.net[0] : query.net;
  return <VerifyView address={getAddress(address) as `0x${string}`} network={networkFromParam(net)} />;
}

export function VerifyPage(props: Props) {
  return (
    <main className="pt-28 pb-24 md:pt-36">
      <Container>
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <Resolved {...props} />
        </Suspense>
      </Container>
    </main>
  );
}
