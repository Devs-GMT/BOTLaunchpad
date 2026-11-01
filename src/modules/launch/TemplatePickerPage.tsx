import { Kicker, Section, TwoToneHeading } from "@/components/ui";
import { safetyNote } from "@/config/site";
import { allTemplates } from "@/templates";
import { TemplateCard } from "./components/TemplateCard";

export function TemplatePickerPage() {
  return (
    <main className="pt-28 md:pt-36">
      <Section flush className="pb-20 md:pb-32">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-5">
            <Kicker bullet>Step 1 of 4 · Choose a template</Kicker>
            <TwoToneHeading as="h1" size="h1" lines={["Pick what to launch.", "Five small contracts, ready to go."]} />
          </div>
          <p className="max-w-prose text-body text-ink-500">
            Every template is tiny, tested and compiled ahead of time. You fill in a short form and your wallet deploys it.
          </p>
        </div>
        <ul className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {allTemplates.map((t) => (
            <li key={t.slug}>
              <TemplateCard template={t} />
            </li>
          ))}
        </ul>
        <p className="mt-12 font-mono text-micro uppercase text-ink-500">{safetyNote}</p>
      </Section>
    </main>
  );
}
