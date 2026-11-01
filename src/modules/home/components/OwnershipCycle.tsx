"use client";

import { useEffect, useState } from "react";
import { PixelIcon, type PixelIconName } from "@/components/graphics";
import { cn } from "@/lib/cn";

const facts: { n: string; title: string; detail: string; icon: PixelIconName }[] = [
  { n: "01", title: "Own", detail: "Your wallet deploys", icon: "key" },
  { n: "02", title: "Verify", detail: "Code hash checked by the registry", icon: "shield" },
  { n: "03", title: "Open", detail: "Source shown before you launch", icon: "code" },
];

const EVERY_MS = 3_600;

/** Pixel key/shield/code on a dark grid, cycling through the three guarantees. Pauses on hover/focus and for reduced motion. */
export function OwnershipCycle() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActive((i) => (i + 1) % facts.length), EVERY_MS);
    return () => clearInterval(t);
  }, [paused]);

  const fact = facts[active]!;

  return (
    <div
      className="pixel-grid-dark relative flex min-h-96 flex-col justify-between border border-paper-0/10 p-5 md:p-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="What you get">
        {facts.map((f, i) => (
          <button
            key={f.n}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={cn(
              "h-8 cursor-pointer border px-2.5 font-mono text-micro uppercase transition-colors",
              i === active ? "border-teal-300 text-paper-50" : "border-paper-0/12 text-paper-500 hover:border-paper-0/30",
            )}
          >
            {f.n} {f.title}
          </button>
        ))}
      </div>

      <div className="relative flex flex-1 items-center justify-center py-10 text-paper-50">
        <PixelIcon key={fact.icon} name={fact.icon} cell={14} accentClassName="fill-teal-300" className="animate-enter" />
        <span
          key={fact.n}
          className="absolute right-0 top-6 animate-enter border border-paper-0/12 bg-coal-800 px-2.5 py-1.5 font-mono text-micro uppercase text-paper-50 md:right-6"
          role="tabpanel"
          aria-live="polite"
        >
          {fact.n} {fact.title} · <span className="text-paper-500">{fact.detail}</span>
        </span>
      </div>

      <p className="font-mono text-micro uppercase text-paper-500">No approvals · No fees · Code checked</p>
    </div>
  );
}
