"use client";

import { CodeView } from "@/components/code";
import { Button, Field, LedgerRow, LinkButton, NotchCard, SegmentedControl, Tabs, TextInput } from "@/components/ui";
import { RequireWallet } from "@/components/web3";
import { networks, type NetworkConfig, type NetworkKey } from "@/config/networks";
import { external } from "@/config/site";
import { byteLength } from "@/lib/format";
import type { Template } from "@/templates";
import { hasRegistry, useWallet } from "@/web3";
import { ConstructorCall } from "./ConstructorCall";
import { GasLine } from "./GasLine";

export const FEED_NAME_MAX = 64;

export function feedNameError(name: string): string | undefined {
  if (!name.trim()) return "Give it a name for the feed.";
  if (byteLength(name.trim()) > FEED_NAME_MAX) return `Keep it under ${FEED_NAME_MAX} bytes.`;
  return undefined;
}

export interface ReviewStepProps {
  template: Template;
  values: Record<string, unknown>;
  args: unknown[];
  feedName: string;
  onFeedName: (name: string) => void;
  network: NetworkConfig;
  onNetwork: (key: NetworkKey) => void;
  onBack: () => void;
  onLaunch: () => void;
  busy: boolean;
}

const networkOptions = [
  { value: "testnet", label: "Testnet", hint: "free · try first" },
  { value: "mainnet", label: "Mainnet", hint: "real BOT" },
] as const;

export function ReviewStep({ template, values, args, feedName, onFeedName, network, onNetwork, onBack, onLaunch, busy }: ReviewStepProps) {
  const nameError = feedNameError(feedName);
  const listing = hasRegistry(network);
  const wallet = useWallet();
  const walletElsewhere = wallet.status === "connected" && wallet.chainId !== network.chainId;

  const summary = (
    <div className="flex flex-col gap-8">
      <div>
        {template.summary(values as never).map((row) => (
          <LedgerRow key={row.label} left={<span className="text-ink-500">{row.label}</span>} right={<span className="font-sans text-small text-ink-900 normal-case">{row.value}</span>} />
        ))}
        <LedgerRow left={<span className="text-ink-500">Owner</span>} right={<span className="font-sans text-small text-ink-900">Your wallet</span>} />
        <LedgerRow left={<span className="text-ink-500">Network</span>} right={<span className="font-sans text-small text-ink-900">{network.name}</span>} />
      </div>
      {listing && (
        <Field label="Name in the Launchpad feed" hint="Shown in “Recently launched”. You can skip listing later." error={nameError} counter={{ value: byteLength(feedName.trim()), max: FEED_NAME_MAX }}>
          {({ id, describedBy, invalid }) => (
            <TextInput id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} value={feedName} onChange={(e) => onFeedName(e.target.value)} />
          )}
        </Field>
      )}
      <GasLine template={template} args={args} network={network} />
    </div>
  );

  const code = (
    <div className="flex flex-col gap-6">
      <ConstructorCall template={template} args={args} />
      <CodeView source={template.artifact.source} fileName={template.artifact.fileName} />
      <p className="text-small text-ink-500">
        This is exactly the source that was compiled into the bytecode you&apos;ll deploy. Want to learn or customise it?{" "}
        <a href={external.remix} target="_blank" rel="noopener noreferrer" className="text-ink-900 underline underline-offset-4">
          Open Remix ↗
        </a>
      </p>
    </div>
  );

  const net = (
    <div className="flex flex-col gap-6">
      <SegmentedControl aria-label="Network" options={networkOptions} value={network.key} onChange={onNetwork} />
      {walletElsewhere && (
        <p className="text-small text-ink-700">
          Your wallet is on {wallet.network?.name ?? "another network"}. Confirm the switch to {network.name} in MetaMask.
        </p>
      )}
      <div>
        <LedgerRow left="Chain ID" right={network.chainId} />
        <LedgerRow left="RPC" right={network.rpcUrl.replace("https://", "")} />
        <LedgerRow left="Explorer" right={network.explorerUrl.replace("https://", "")} />
        <LedgerRow left="Launchpad feed" right={listing ? "AVAILABLE" : "NOT LIVE YET"} />
      </div>
      {network.key === "testnet" ? (
        <div className="flex flex-col gap-3 border border-ink-900/12 bg-paper-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-small text-ink-700">Try Testnet first. It&apos;s free: grab test BOT from the faucet.</p>
          <LinkButton href={networks.testnet.faucetUrl ?? ""} external size="sm" variant="secondary">
            Open faucet
          </LinkButton>
        </div>
      ) : (
        <p className="text-small text-ink-500">Mainnet uses real BOT for gas. Your contract is permanent once launched.</p>
      )}
      {!listing && (
        <p className="text-small text-ink-500">Listing in the feed isn&apos;t live on {network.name} yet. Your contract still works and gets its own Interact page.</p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <NotchCard label="Review" tone="paper" bodyClassName="p-5 md:p-8">
        <Tabs
          items={[
            { id: "summary", label: "Summary", content: summary },
            { id: "code", label: "View code", content: code },
            { id: "network", label: `Network · ${network.shortName}`, content: net },
          ]}
        />
      </NotchCard>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="secondary" size="lg" onClick={onBack} disabled={busy}>
          Edit details
        </Button>
        <RequireWallet network={network} size="lg">
          <Button size="lg" trailingArrow onClick={onLaunch} disabled={busy || (listing && Boolean(nameError))}>
            Launch on {network.name}
          </Button>
        </RequireWallet>
      </div>
      <p className="text-small text-ink-500">2 quick transactions: one creates your contract, one lists it. The second is optional.</p>
    </div>
  );
}
