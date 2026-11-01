import { Kicker, Reveal, Section, TwoToneHeading } from "@/components/ui";
import { LaunchChart } from "../components/LaunchChart";

export function LaunchStats() {
  return (
    <Section tone="soft">
      <Reveal className="flex flex-col gap-5">
        <Kicker bullet>Launches so far</Kicker>
        <TwoToneHeading lines={["Your first launch takes minutes.", "Your fifth takes seconds."]} />
      </Reveal>
      <Reveal className="mt-14">
        <LaunchChart />
      </Reveal>
    </Section>
  );
}
