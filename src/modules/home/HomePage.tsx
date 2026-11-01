import { BuiltWith } from "./sections/BuiltWith";
import { ClosingCta } from "./sections/ClosingCta";
import { Hero } from "./sections/Hero";
import { LaunchStats } from "./sections/LaunchStats";
import { Ownership } from "./sections/Ownership";
import { Problem } from "./sections/Problem";
import { Showcase } from "./sections/Showcase";
import { SideBySide } from "./sections/SideBySide";

/** PRD §9: eight sections, in order. Server-rendered; only the live-data pieces are client components. */
export function HomePage() {
  return (
    <main className="flex-1">
      <Hero />
      <BuiltWith />
      <Problem />
      <SideBySide />
      <LaunchStats />
      <Ownership />
      <Showcase />
      <ClosingCta />
    </main>
  );
}
