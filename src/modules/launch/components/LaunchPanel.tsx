"use client";

import { Button, LinkButton, NotchCard, Stepper, type StepItem } from "@/components/ui";
import { AddressPill, RequireWallet, TxLink } from "@/components/web3";
import type { NetworkConfig } from "@/config/networks";
import { contractHref } from "@/lib/explorer";
import { shortAddress } from "@/lib/format";
import type { TxState } from "@/web3";

export interface LaunchPanelProps {
  network: NetworkConfig;
  deployState: TxState;
  registerState: TxState;
  deployed: { address: `0x${string}`; txHash: `0x${string}` } | null;
  listing: boolean;
  onRetryDeploy: () => void;
  onBackToReview: () => void;
  onRegister: () => void;
}

function deploySteps(state: TxState, network: NetworkConfig, deployed: LaunchPanelProps["deployed"]): StepItem[] {
  if (deployed) {
    return [
      { label: "Confirmed in your wallet", status: "done" },
      { label: "Deployed", status: "done", detail: <TxLink hash={deployed.txHash} network={network} /> },
      { label: `Live at ${shortAddress(deployed.address)}`, status: "done" },
    ];
  }
  switch (state.status) {
    case "idle":
    case "signing":
      return [
        { label: "Waiting for confirmation in your wallet", status: "current", detail: "Check MetaMask" },
        { label: "Deploying", status: "upcoming" },
        { label: "Live", status: "upcoming" },
      ];
    case "pending":
      return [
        { label: "Confirmed in your wallet", status: "done" },
        { label: "Deploying…", status: "current", detail: <TxLink hash={state.hash} network={network} /> },
        { label: "Live", status: "upcoming" },
      ];
    case "rejected":
      return [
        { label: "Cancelled in your wallet", status: "error", detail: "Nothing was sent" },
        { label: "Deploying", status: "upcoming" },
        { label: "Live", status: "upcoming" },
      ];
    case "failed":
      return [
        { label: "Confirmed in your wallet", status: state.hash ? "done" : "error" },
        { label: "Deploy failed", status: "error", detail: state.hash ? <TxLink hash={state.hash} network={network} /> : state.error.message },
        { label: "Live", status: "upcoming" },
      ];
    case "confirmed":
      return [
        { label: "Confirmed in your wallet", status: "done" },
        { label: "Deployed", status: "done", detail: <TxLink hash={state.hash} network={network} /> },
        { label: "Live", status: "current" },
      ];
  }
}

function registerStep(state: TxState, network: NetworkConfig, deployed: boolean): StepItem {
  if (!deployed) return { label: "List in the Launchpad feed", status: "upcoming" };
  switch (state.status) {
    case "idle":
      return { label: "List in the Launchpad feed", status: "current", detail: "Optional · 2nd transaction" };
    case "signing":
      return { label: "Listing: confirm in your wallet", status: "current", detail: "Check MetaMask" };
    case "pending":
      return { label: "Listing…", status: "current", detail: <TxLink hash={state.hash} network={network} /> };
    case "confirmed":
      return { label: "Listed in the feed", status: "done", detail: <TxLink hash={state.hash} network={network} /> };
    case "rejected":
      return { label: "Listing cancelled", status: "error", detail: "Your contract still works" };
    case "failed":
      return { label: "Listing failed", status: "error", detail: state.error.message };
  }
}

export function LaunchPanel({ network, deployState, registerState, deployed, listing, onRetryDeploy, onBackToReview, onRegister }: LaunchPanelProps) {
  const steps = [...deploySteps(deployState, network, deployed), ...(listing ? [registerStep(registerState, network, Boolean(deployed))] : [])];
  const deployError = deployState.status === "rejected" || deployState.status === "failed" ? deployState.error : null;
  const registerError = registerState.status === "rejected" || registerState.status === "failed" ? registerState.error : null;
  const registerBusy = registerState.status === "signing" || registerState.status === "pending";

  return (
    <NotchCard label="Launch" tone="paper" bodyClassName="p-5 md:p-8">
      <div aria-live="polite">
        <Stepper steps={steps} />
      </div>

      {deployError && !deployed && (
        <div className="mt-8 flex flex-col gap-4 border-t border-ink-900/10 pt-6">
          <p className="text-small text-danger-600">{deployError.message}</p>
          <div className="flex flex-wrap gap-3">
            <RequireWallet network={network}>
              <Button onClick={onRetryDeploy}>Try again</Button>
            </RequireWallet>
            <Button variant="secondary" onClick={onBackToReview}>
              Back to review
            </Button>
          </div>
        </div>
      )}

      {deployed && (
        <div className="mt-8 flex flex-col gap-5 border-t border-ink-900/10 pt-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-lilac-200 px-4 py-3">
            <span className="text-small font-medium text-ink-900">Live at</span>
            <AddressPill address={deployed.address} network={network} markYou={false} />
          </div>
          {listing && registerState.status !== "confirmed" && (
            <>
              <p className="text-small text-ink-500">
                One more (optional) transaction lists it in “Recently launched”. The registry checks it&apos;s a real Launchpad template and that you own it.
              </p>
              {registerError && <p className="text-small text-danger-600">{registerError.message}</p>}
              <div className="flex flex-wrap gap-3">
                <RequireWallet network={network}>
                  <Button onClick={onRegister} disabled={registerBusy} trailingArrow>
                    {registerError ? "Try listing again" : "Add to Launchpad feed"}
                  </Button>
                </RequireWallet>
                <LinkButton href={contractHref(deployed.address, network, { fresh: true })} variant="ghost">
                  Skip for now
                </LinkButton>
              </div>
            </>
          )}
          {(!listing || registerState.status === "confirmed") && (
            <LinkButton href={contractHref(deployed.address, network, { fresh: true })} size="lg" trailingArrow className="self-start">
              Open your contract
            </LinkButton>
          )}
        </div>
      )}
    </NotchCard>
  );
}
