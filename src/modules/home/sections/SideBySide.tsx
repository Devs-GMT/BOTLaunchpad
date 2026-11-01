import type { ReactNode } from "react";
import { LogoMark, PixelIcon } from "@/components/graphics";
import { Chip, Kicker, Pill, Reveal, Section, StatusDot, TwoToneHeading } from "@/components/ui";
import { cn } from "@/lib/cn";
import { LiveRegistryRows } from "../components/LiveRegistryRows";

const byHand = ["Install tools", "Write Contract.sol", "Compile", "Add network", "Deploy", "Copy address", "Verify", "Build a UI"];
const withTemplate = ["Pick a template", "Fill the form", "Launch"];

export function SideBySide() {
  return (
    <Section id="how" className="scroll-mt-20">
      <Reveal className="grid gap-6 lg:grid-cols-2 lg:items-end">
        <div className="flex flex-col gap-5">
          <Kicker bullet>How it works</Kicker>
          <TwoToneHeading lines={["Remix shows you how.", "Launchpad does it for you."]} />
        </div>
        <p className="max-w-prose text-body text-ink-500 lg:justify-self-end">
          The contracts are already written, tested and compiled. You bring a name and a few settings. Your wallet signs, and
          the contract is yours from its first block.
        </p>
      </Reveal>

      <Reveal className="mt-14 grid border border-ink-900/12 md:grid-cols-2">
        <Panel
          tone="old"
          chips={
            <>
              <Chip label="Remix" icon={<PixelIcon name="code" cell={1.5} className="text-ink-500" accentClassName="fill-ink-500" />} />
              <Chip label="Old way" icon={<StatusDot status="old" />} />
            </>
          }
          title="Deploying by hand."
          count={<Pill tone="dashed">Steps: {byHand.length}</Pill>}
          steps={byHand}
        />
        <Panel
          tone="new"
          chips={
            <>
              <Chip label="Launchpad" icon={<LogoMark size={14} />} />
              <Chip label="Live" icon={<StatusDot status="live" pulse />} />
            </>
          }
          title="Launching with a template."
          count={<Pill tone="lilac">Steps: {withTemplate.length}</Pill>}
          steps={withTemplate}
          footer={<LiveRegistryRows />}
          float={
            <div aria-hidden className="absolute -top-5 right-5 hidden gap-2 sm:flex">
              <span className="flex size-11 items-center justify-center border border-ink-900/12 bg-paper-0">
                <LogoMark size={20} />
              </span>
              <span className="flex size-11 items-center justify-center border border-ink-900/12 bg-paper-0 text-ink-900">
                <PixelIcon name="wallet" cell={2} />
              </span>
            </div>
          }
        />
      </Reveal>
    </Section>
  );
}

interface PanelProps {
  tone: "old" | "new";
  chips: ReactNode;
  title: string;
  count: ReactNode;
  steps: string[];
  footer?: ReactNode;
  float?: ReactNode;
}

function Panel({ tone, chips, title, count, steps, footer, float }: PanelProps) {
  return (
    <div className={cn("relative flex flex-col gap-6 p-5 md:p-8", tone === "old" ? "bg-paper-300" : "bg-lilac-200")}>
      {float}
      <div className="flex flex-wrap gap-2">{chips}</div>
      <h3 className="text-h3">{title}</h3>
      <div className="flex flex-1 flex-col gap-5 border border-ink-900/10 bg-paper-0 p-4 md:p-5">
        <div className="flex items-center justify-between">
          <span className="text-small font-medium">Steps</span>
          {count}
        </div>
        <ol className="flex flex-col">
          {steps.map((s, i) => (
            <li key={s} className="flex h-10 items-center gap-3 border-b border-ink-900/8 text-small last:border-b-0">
              <span className="font-mono text-micro tabular-nums text-ink-500">{String(i + 1).padStart(2, "0")}</span>
              <span className={tone === "old" ? "text-ink-700" : "text-ink-900"}>{s}</span>
            </li>
          ))}
        </ol>
        {footer && <div className="mt-auto">{footer}</div>}
      </div>
    </div>
  );
}
