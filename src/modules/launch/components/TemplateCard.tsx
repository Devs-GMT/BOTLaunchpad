import Link from "next/link";
import { PixelIcon } from "@/components/graphics";
import { ArrowRight, Chip, FolderCard, Kicker } from "@/components/ui";
import type { Template } from "@/templates";
import { EstimatedCost } from "./EstimatedCost";

export function TemplateCard({ template }: { template: Template }) {
  const { artifact } = template;
  return (
    <Link href={`/launch/${template.slug}`} className="group block h-full" aria-label={`Use the ${template.title} template`}>
      <FolderCard
        className="h-full transition-transform duration-200 ease-out-quint group-hover:-translate-y-1"
        tab={<Chip label={artifact.fileName} meta={`${artifact.functionsCount} fn${artifact.functionsCount === 1 ? "" : "s"}`} />}
        media={
          <div className="pixel-grid flex h-36 items-center justify-center border-y border-ink-900/8 bg-paper-200 text-ink-900">
            <PixelIcon name={template.icon} cell={7} />
          </div>
        }
        bodyClassName="gap-3"
      >
        <Kicker bullet>{template.category}</Kicker>
        <h2 className="text-h3">{template.title}</h2>
        <p className="text-small text-ink-500">{template.useCase}</p>
        <div className="mt-auto flex flex-col gap-4 pt-4">
          <p className="font-mono text-micro uppercase text-ink-500">
            Functions: {artifact.functionsCount} · Est. gas <EstimatedCost gas={artifact.deployGas} />
          </p>
          <span className="inline-flex items-center gap-1.5 text-small font-medium text-ink-900">
            Use this template <ArrowRight className="transition-transform duration-150 group-hover:translate-x-0.5" />
          </span>
        </div>
      </FolderCard>
    </Link>
  );
}
