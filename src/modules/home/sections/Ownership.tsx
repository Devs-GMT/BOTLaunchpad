import { LinkButton, NotchCard, Reveal, Section, TwoToneHeading } from "@/components/ui";
import { OwnershipCycle } from "../components/OwnershipCycle";

export function Ownership() {
  return (
    <Section>
      <Reveal>
        <NotchCard label="Ownership & Safety" bodyClassName="grid gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="flex flex-col gap-6 lg:col-span-5 lg:py-6">
            <TwoToneHeading tone="dark" lines={["Owned by you", "from the first block."]} />
            <p className="max-w-prose text-body text-paper-500">
              Your wallet sends the deploy transaction, so your address is the owner. Launchpad never holds keys, never asks for
              token approvals and takes no fee. The registry only lists contracts whose code matches a template exactly.
            </p>
            <LinkButton href="/launch" variant="teal" size="lg" trailingArrow className="self-start">
              Read the templates
            </LinkButton>
          </div>
          <div className="lg:col-span-7">
            <OwnershipCycle />
          </div>
        </NotchCard>
      </Reveal>
    </Section>
  );
}
