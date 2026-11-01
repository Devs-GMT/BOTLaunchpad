import Link from "next/link";
import { PixelIcon } from "@/components/graphics";
import { ArrowRight, Chip, FolderCard, Kicker, Reveal, Section, TwoToneHeading } from "@/components/ui";
import { allTemplates } from "@/templates";

export function Showcase() {
  return (
    <Section id="templates" className="scroll-mt-20 overflow-hidden">
      <Reveal className="flex flex-col items-center gap-5 text-center">
        <Kicker bullet>Templates</Kicker>
        <TwoToneHeading lines={["Five things", "Launchpad can do."]} />
      </Reveal>
      <Reveal className="mt-14">
        <ul className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-4 px-4 pb-4 md:-mx-8 md:scroll-px-8 md:px-8 lg:-mx-16 lg:scroll-px-16 lg:px-16">
          {allTemplates.map((t) => (
            <li key={t.slug} className="flex w-72 shrink-0 snap-start flex-col gap-3 md:w-80">
              <Kicker bullet>{t.category}</Kicker>
              <Link href={`/launch/${t.slug}`} className="group block flex-1" aria-label={`Launch a ${t.title}`}>
                <FolderCard
                  className="h-full transition-transform duration-200 ease-out-quint group-hover:-translate-y-1"
                  tab={<Chip label={t.artifact.fileName} />}
                  media={
                    <div className="pixel-grid relative flex h-60 items-center justify-center border-y border-ink-900/8 bg-paper-200 text-ink-900">
                      <PixelIcon name={t.icon} cell={10} accentClassName="fill-ink-500" />
                      <span className="absolute bottom-3 left-3 border border-ink-900/12 bg-paper-0 px-3 py-1.5 text-body font-medium">
                        {t.title}
                      </span>
                    </div>
                  }
                  bodyClassName="gap-4"
                >
                  <p className="text-small text-ink-500">{t.useCase}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-small font-medium">
                    Use this template <ArrowRight className="transition-transform duration-150 group-hover:translate-x-0.5" />
                  </span>
                </FolderCard>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
