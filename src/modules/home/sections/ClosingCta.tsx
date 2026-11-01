import type { ReactNode } from "react";
import { DotWorldMap } from "@/components/graphics";
import { Kicker, Reveal, Section, TwoToneHeading } from "@/components/ui";
import { safetyNote } from "@/config/site";
import { LaunchCostRange } from "../components/LaunchCostRange";
import { NetworkLaunchButton } from "../components/NetworkLaunchButton";

const faq: { q: string; a: ReactNode }[] = [
  {
    q: "Do I need to code?",
    a: "No. The contracts are already written, tested and compiled. You fill in a short form and confirm in MetaMask.",
  },
  {
    q: "Who owns the contract?",
    a: "The wallet that launches it. Your address is stored as the owner. Launchpad has no admin rights over it.",
  },
  {
    q: "What does it cost?",
    a: (
      <>
        Just gas, about <LaunchCostRange /> to launch at today&apos;s price, plus a smaller listing transaction. No fees.
      </>
    ),
  },
  {
    q: "Why two transactions?",
    a: "The first deploys your contract. The second lists it in the public Launchpad registry. Listing is optional and you can do it later.",
  },
  {
    q: "Can I verify it?",
    a: "Yes. Every contract has a Verify page with the exact compiler input and constructor arguments, which gives a full match on the explorer.",
  },
  {
    q: "Is it safe?",
    a: `There are no token approvals and no permissions to grant. The templates are small and tested. ${safetyNote}`,
  },
];

const beacons = [
  { at: [106.8, -6.2] as const, tone: "teal" as const },
  { at: [-74, 40.7] as const, tone: "teal" as const },
  { at: [13.4, 52.5] as const, tone: "teal" as const },
  { at: [139.7, 35.7] as const, tone: "teal" as const },
];

export function ClosingCta() {
  return (
    <Section tone="coal" grid className="overflow-hidden">
      <DotWorldMap beacons={beacons} className="pointer-events-none absolute inset-x-0 top-1/4 mx-auto max-w-rail-wide opacity-40" />
      <Reveal className="relative flex flex-col items-center gap-8 py-10 text-center md:py-20">
        <Kicker tone="dark" bullet>
          Start on Testnet
        </Kicker>
        <TwoToneHeading size="h1" tone="dark" lines={["Find out how fast", "you can ship on BOT Chain."]} />
        <div className="flex flex-wrap justify-center gap-3">
          <NetworkLaunchButton network="testnet" variant="teal" size="lg" trailingArrow>
            Launch on Testnet
          </NetworkLaunchButton>
          <NetworkLaunchButton network="mainnet" variant="outline-light" size="lg" trailingArrow>
            Launch on Mainnet
          </NetworkLaunchButton>
        </div>
      </Reveal>

      <div id="faq" className="relative mt-16 scroll-mt-20 border-t border-paper-0/10 pt-10">
        <h2 className="sr-only">Questions</h2>
        <ul className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          {faq.map((item) => (
            <li key={item.q} className="border-b border-paper-0/10">
              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-body text-paper-50">
                  {item.q}
                  <span aria-hidden className="font-mono text-mono text-paper-500 transition-transform duration-150 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-small text-paper-500">{item.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
