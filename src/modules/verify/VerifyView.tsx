"use client";

import { useQuery } from "@tanstack/react-query";
import { Contract } from "ethers";
import Link from "next/link";
import { useMemo } from "react";
import { CodeView } from "@/components/code";
import { PixelIcon } from "@/components/graphics";
import { ArrowRight, buttonVariants, Kicker, LedgerRow, LinkButton, NotchCard, Skeleton, Stepper, TwoToneHeading } from "@/components/ui";
import type { NetworkConfig } from "@/config/networks";
import { addressUrl, contractHref } from "@/lib/explorer";
import { useResolveContract } from "@/templates/resolve";
import { compiler, encodeConstructorArgs, standardInput } from "@/templates/verify";
import { readProvider } from "@/web3";
import { CopyBlock } from "./components/CopyBlock";

export function VerifyView({ address, network }: { address: `0x${string}`; network: NetworkConfig }) {
  const resolved = useResolveContract(address, network);
  const template = resolved.data?.kind === "template" ? resolved.data.template : null;

  const args = useQuery({
    queryKey: ["verifyArgs", network.chainId, address.toLowerCase()],
    enabled: Boolean(template),
    staleTime: Infinity,
    queryFn: async () => {
      const c = new Contract(address, template!.artifact.abi, readProvider(network));
      return encodeConstructorArgs(template!.artifact, await template!.readArgs(c));
    },
  });

  const jsonHref = useMemo(() => {
    if (!template) return null;
    const blob = JSON.stringify(standardInput(template.artifact), null, 2);
    return `data:application/json;charset=utf-8,${encodeURIComponent(blob)}`;
  }, [template]);

  if (resolved.isLoading) return <Skeleton className="h-96 w-full" />;
  if (!template) {
    return (
      <div className="flex flex-col items-start gap-6 py-10">
        <TwoToneHeading as="h1" size="h1" lines={["Nothing to verify here.", "This isn't a Launchpad contract on this network."]} />
        <LinkButton href={contractHref(address, network)} variant="secondary">
          Back to the contract
        </LinkButton>
      </div>
    );
  }

  const { artifact } = template;
  const explorerHost = network.explorerUrl.replace("https://", "");
  const steps = [
    { label: `Open the contract on ${explorerHost} and go to Contract → Verify & publish.`, status: "upcoming" as const },
    { label: "Method: Solidity (Standard JSON input). Upload the JSON file from this page.", status: "upcoming" as const },
    { label: `Compiler ${compiler.version}. Contract name: ${artifact.contractName} (file ${artifact.sourcePath}).`, status: "upcoming" as const },
    { label: "Turn off “Try to fetch constructor arguments automatically” and paste the arguments below.", status: "upcoming" as const },
    { label: "License: MIT. Submit. The explorer recompiles the same input and reports a full match.", status: "upcoming" as const },
  ];

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-5">
        <Link href={contractHref(address, network)} className="font-mono text-mono uppercase text-ink-500 hover:text-ink-900">
          ← Back to the contract
        </Link>
        <div className="flex items-center gap-3 text-ink-900">
          <PixelIcon name="code" cell={4} />
          <Kicker bullet>Verify helper · {network.shortName}</Kicker>
        </div>
        <TwoToneHeading as="h1" size="h1" lines={["Publish the source.", "Everything the explorer asks for."]} />
        <p className="max-w-prose text-body text-ink-500">
          Verifying shows the source next to your contract on the explorer, so anyone can read exactly what it does. It costs nothing and needs no wallet.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="flex flex-col gap-10 lg:col-span-7">
          <div>
            <LedgerRow left="Contract name" right={artifact.contractName} />
            <LedgerRow left="Compiler" right={compiler.version} />
            <LedgerRow left="Optimizer" right={`ENABLED · ${compiler.optimizer.runs} RUNS`} />
            <LedgerRow left="EVM version" right={compiler.evmVersion.toUpperCase()} />
            <LedgerRow left="Metadata hash" right={compiler.bytecodeHash.toUpperCase()} />
            <LedgerRow left="License" right={compiler.license} />
            <LedgerRow left="Source file" right={artifact.sourcePath} />
          </div>

          {args.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <CopyBlock
              id="constructor-args"
              label="Constructor arguments (ABI-encoded)"
              value={args.data ?? ""}
              hint="Read back from the contract's public values and encoded in your browser."
              scroll
            />
          )}

          <div className="flex flex-col gap-3">
            <Kicker>Standard JSON input</Kicker>
            <div className="flex flex-wrap items-center gap-3">
              {jsonHref && (
                <a href={jsonHref} download={`${artifact.contractName}.standard-input.json`} className={buttonVariants()}>
                  Download {artifact.contractName}.standard-input.json <ArrowRight />
                </a>
              )}
            </div>
            <p className="text-small text-ink-500">
              This is the exact compiler input that produced the bytecode you deployed: same source path, optimizer, EVM version and metadata. Uploading it as-is gives a full match.
            </p>
          </div>

          <CodeView source={artifact.source} fileName={artifact.fileName} />
        </div>

        <aside className="lg:col-span-5">
          <NotchCard label="Steps" tone="soft" bodyClassName="p-5 md:p-8">
            <Stepper steps={steps} />
            <div className="mt-8">
              <LinkButton href={addressUrl(network, address)} external>
                Open on {explorerHost}
              </LinkButton>
            </div>
          </NotchCard>
        </aside>
      </div>
    </div>
  );
}
