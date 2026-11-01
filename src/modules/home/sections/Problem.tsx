import { PixelIcon, type PixelIconName } from "@/components/graphics";
import { Chip, FolderCard, Kicker, Reveal, Section, TwoToneHeading } from "@/components/ui";

const cards: { n: string; file: string; icon: PixelIconName; tag: string; title: string; detail: string; note: string }[] = [
  {
    n: "01",
    file: "setup.md",
    icon: "code",
    tag: "Remix · solc · RPC",
    title: "The toolkit.",
    detail: "An IDE, a compiler version and a custom network, all before line one.",
    note: "Hours of setup for a ten-minute idea.",
  },
  {
    n: "02",
    file: "Contract.sol",
    icon: "book",
    tag: "pragma ^0.8.20",
    title: "The language.",
    detail: "Solidity syntax, compiler errors and tests you have to write yourself.",
    note: "A new language for a small contract.",
  },
  {
    n: "03",
    file: "deploy.ts",
    icon: "map",
    tag: "gas · args · verify",
    title: "The last mile.",
    detail: "Gas, constructor arguments, explorer verification and a UI to use it.",
    note: "Deploying is half the job.",
  },
];

export function Problem() {
  return (
    <Section id="why" className="scroll-mt-20">
      <Reveal className="flex flex-col gap-5">
        <Kicker bullet>Why Launchpad</Kicker>
        <TwoToneHeading lines={["You want to build on BOT Chain.", "Your first contract takes an afternoon."]} />
      </Reveal>
      <ul className="mt-14 grid gap-6 md:grid-cols-3">
        {cards.map((c, i) => (
          <li key={c.n}>
            <Reveal index={i} className="h-full">
              <FolderCard
                className="h-full"
                tabWidth="58%"
                tab={<Chip label={c.file} meta={c.n} />}
                media={
                  <div className="pixel-grid relative flex h-52 items-center justify-center border-y border-ink-900/8 bg-paper-300 text-ink-700">
                    <PixelIcon name={c.icon} cell={9} accentClassName="fill-ember-500" />
                    <Chip
                      className="absolute bottom-3 left-3 h-7 font-mono text-micro uppercase"
                      icon={<span aria-hidden className="size-1.5 bg-ember-500" />}
                      label={c.tag}
                    />
                  </div>
                }
                bodyClassName="gap-2"
              >
                <p className="text-body font-medium text-ink-900">
                  {c.title} <span className="text-ink-700">{c.detail}</span>
                </p>
                <p className="text-small text-ink-500">{c.note}</p>
              </FolderCard>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
