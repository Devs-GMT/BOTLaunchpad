"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { PixelIcon } from "@/components/graphics";
import { Kicker, Skeleton, Stepper, type StepItem } from "@/components/ui";
import { networks, type NetworkKey } from "@/config/networks";
import { safetyNote } from "@/config/site";
import { contractHref } from "@/lib/explorer";
import { clampBytes, templateBySlug } from "@/templates";
import { hasRegistry, useSelectedNetwork, useWallet } from "@/web3";
import { FEED_NAME_MAX, ReviewStep } from "./components/ReviewStep";
import { LaunchPanel } from "./components/LaunchPanel";
import { TemplateForm } from "./components/TemplateForm";
import { useDeploy } from "./hooks/useDeploy";
import { useRegister } from "./hooks/useRegister";
import { useWizard } from "./hooks/useWizard";

export function LaunchWizard({ slug }: { slug: string }) {
  const template = templateBySlug(slug)!;
  const wizard = useWizard(template);
  const [selectedNetwork, setNetwork] = useSelectedNetwork();
  const wallet = useWallet();
  const router = useRouter();

  // Picking a network in the UI also moves the wallet there, so the navbar chip and the launch target agree.
  const chooseNetwork = (key: NetworkKey) => {
    setNetwork(key);
    const target = networks[key];
    if (wallet.status === "connected" && wallet.chainId !== target.chainId) {
      wallet.switchTo(target).catch(() => {
        /* user declined in the wallet; RequireWallet keeps offering the switch */
      });
    }
  };

  // Once deployed, the network is fixed to where the contract lives.
  const network = wizard.deployed ? Object.values(networks).find((n) => n.chainId === wizard.deployed!.chainId)! : selectedNetwork;
  const listing = hasRegistry(network);

  const deploy = useDeploy(template, network);
  const register = useRegister(network);

  const args = useMemo(() => (wizard.values ? template.toArgs(wizard.values as never) : null), [template, wizard.values]);

  const startDeploy = async () => {
    if (!args) return;
    wizard.update({ step: "launch" });
    const result = await deploy.deploy(args, wizard.feedName.trim());
    if (result) wizard.update({ deployed: { ...result, chainId: network.chainId } });
  };

  const startRegister = async () => {
    if (!wizard.deployed) return;
    const ok = await register.register(wizard.deployed.address, template.id, wizard.feedName.trim());
    if (ok) {
      const href = contractHref(wizard.deployed.address, network, { fresh: true });
      wizard.reset();
      router.push(href);
    }
  };

  const stepIndex = { form: 0, review: 1, launch: wizard.deployed ? 3 : 2 }[wizard.step];
  const labels = ["Fill the form", "Review", "Launch", "List it"];
  const steps: StepItem[] = labels.map((label, i) => ({
    label,
    status: i < stepIndex ? "done" : i === stepIndex ? "current" : "upcoming",
  }));

  return (
    <main className="pt-28 md:pt-36">
      <div className="mx-auto grid w-full max-w-rail gap-10 px-4 pb-24 md:px-8 lg:grid-cols-12 lg:gap-16 lg:px-16">
        <aside className="flex flex-col gap-8 lg:col-span-4">
          <Link href="/launch" className="font-mono text-mono uppercase text-ink-500 hover:text-ink-900">
            ← All templates
          </Link>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-ink-900">
              <PixelIcon name={template.icon} cell={4} />
              <Kicker bullet>{template.category}</Kicker>
            </div>
            <h1 className="text-h2-sm md:text-h2">{template.title}</h1>
            <p className="text-body text-ink-500">{template.description}</p>
          </div>
          <div className="hidden lg:block">
            <Stepper steps={steps} />
          </div>
          <p className="hidden font-mono text-micro uppercase text-ink-500 lg:block">{safetyNote}</p>
        </aside>

        <section className="lg:col-span-8" aria-label={labels[stepIndex]}>
          <div className="mb-6 lg:hidden">
            <Stepper orientation="horizontal" steps={steps} />
          </div>
          {!wizard.hydrated ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-1/2" />
            </div>
          ) : wizard.step === "form" || !wizard.values || !args ? (
            <TemplateForm
              template={template}
              initial={wizard.values}
              onSubmit={(values) =>
                wizard.update({
                  values,
                  step: "review",
                  feedName: wizard.feedName || clampBytes(template.feedName(values as never), FEED_NAME_MAX),
                })
              }
            />
          ) : wizard.step === "review" ? (
            <ReviewStep
              template={template}
              values={wizard.values}
              args={args}
              feedName={wizard.feedName}
              onFeedName={(feedName) => wizard.update({ feedName })}
              network={network}
              onNetwork={chooseNetwork}
              onBack={() => wizard.update({ step: "form" })}
              onLaunch={startDeploy}
              busy={deploy.isBusy}
            />
          ) : (
            <LaunchPanel
              network={network}
              deployState={deploy.state}
              registerState={register.state}
              deployed={wizard.deployed}
              listing={listing}
              onRetryDeploy={startDeploy}
              onBackToReview={() => {
                deploy.reset();
                wizard.update({ step: "review" });
              }}
              onRegister={startRegister}
            />
          )}
        </section>
      </div>
    </main>
  );
}
