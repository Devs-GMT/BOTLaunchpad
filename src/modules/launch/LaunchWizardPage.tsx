import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui";
import { templateBySlug, templateSlugs } from "@/templates";
import { LaunchWizard } from "./LaunchWizard";

type Params = { params: Promise<{ template: string }> };

export function launchStaticParams() {
  return templateSlugs.map((template) => ({ template }));
}

export async function launchMetadata({ params }: Params): Promise<Metadata> {
  const template = templateBySlug((await params).template);
  return template ? { title: `Launch a ${template.title}`, description: template.useCase } : {};
}

async function ResolvedWizard({ params }: Params) {
  const { template } = await params;
  if (!templateBySlug(template)) notFound();
  return <LaunchWizard slug={template} />;
}

function WizardFallback() {
  return (
    <main className="mx-auto grid w-full max-w-rail gap-10 px-4 pt-36 md:px-8 lg:grid-cols-12 lg:gap-16 lg:px-16">
      <div className="flex flex-col gap-4 lg:col-span-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="flex flex-col gap-4 lg:col-span-8">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </main>
  );
}

export function LaunchWizardPage(props: Params) {
  return (
    <Suspense fallback={<WizardFallback />}>
      <ResolvedWizard {...props} />
    </Suspense>
  );
}
