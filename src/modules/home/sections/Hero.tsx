import { Kicker, LinkButton, Container, TwoToneHeading } from "@/components/ui";
import { BlockTimeline } from "../components/BlockTimeline";

export function Hero() {
  return (
    <section className="pixel-grid relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28">
      <Container rail="wide" className="grid items-center gap-14 lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col gap-7 lg:col-span-7">
          <Kicker bullet>No-code contracts on BOT Chain</Kicker>
          <TwoToneHeading as="h1" size="hero" lines={["Your first contract", "is one click", "away."]} />
          <p className="max-w-prose text-body-lg text-ink-500">
            Pick a template, fill a short form, confirm in MetaMask. A real smart contract on BOT Chain, owned by you, in about
            two minutes.
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/launch" size="lg" trailingArrow>
              Launch a contract
            </LinkButton>
            <LinkButton href="/#how" size="lg" variant="secondary">
              See how it works
            </LinkButton>
          </div>
        </div>
        <div className="lg:col-span-5">
          <BlockTimeline />
        </div>
      </Container>
    </section>
  );
}
