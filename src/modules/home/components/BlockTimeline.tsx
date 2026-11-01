"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { DotMatrixStack, stackGeometry } from "@/components/graphics";
import { Skeleton, StatusDot } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { useBlockNumber } from "@/web3";
import { liveNetwork } from "@/config/addresses";
import { BlockTag } from "./BlockTag";

// BOT Chain produces a block every ~0.75 s: 80 blocks ≈ 1 minute, 4,800 ≈ 1 hour, 115,200 ≈ 1 day.
const marks = [
  { label: "Latest block", back: 0 },
  { label: "1 min ago", back: 80 },
  { label: "1 hour ago", back: 4_800 },
  { label: "1 day ago", back: 115_200 },
] as const;

const geo = stackGeometry(marks.length);
const pct = (f: number) => `${(f * 100).toFixed(2)}%`;
// Where the lilac "your contract" cluster sits on the top plane.
const cluster = { left: pct((geo.cx + 30) / geo.width), top: pct(geo.plane(0).top + 52 / geo.height) };

/**
 * Hero art: each dot plane is a real block. Hover a plane, click a label or drag the scrubber along the
 * timeline to lift that block out of the stack and read its number, transactions and age from the RPC.
 */
export function BlockTimeline() {
  const { data: latest, isError } = useBlockNumber(liveNetwork);
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const axis = useRef<HTMLDivElement>(null);
  const stack = useRef<HTMLDivElement>(null);

  const shown = hover ?? active;
  const blockOf = (i: number) => (latest === undefined ? undefined : latest - marks[i]!.back);

  // Planes are picked by pointer height over a box that never moves. Hit-testing the planes themselves
  // flickers: a lifted plane slides out from under the pointer and the one below takes over.
  function nearest(clientY: number, el = axis.current) {
    const rect = el?.getBoundingClientRect();
    if (!rect) return active;
    const f = (clientY - rect.top) / rect.height;
    let best = 0;
    marks.forEach((_, i) => {
      if (Math.abs(geo.plane(i).middle - f) < Math.abs(geo.plane(best).middle - f)) best = i;
    });
    return best;
  }

  function onAxisDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setHover(null);
    setActive(nearest(e.clientY));
  }

  function onAxisMove(e: PointerEvent<HTMLDivElement>) {
    if (dragging) setActive(nearest(e.clientY));
  }

  function onKey(e: KeyboardEvent) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    setActive((i) => Math.min(marks.length - 1, Math.max(0, i + (e.key === "ArrowDown" ? 1 : -1))));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex gap-3 select-none sm:gap-6" onPointerLeave={() => setHover(null)}>
        <div
          ref={stack}
          className="relative mx-auto min-w-0 max-w-md flex-1 cursor-pointer"
          onPointerMove={(e) => e.pointerType === "mouse" && setHover(nearest(e.clientY, stack.current))}
          onClick={(e) => {
            setActive(nearest(e.clientY, stack.current));
            setHover(null);
          }}
        >
          <DotMatrixStack planes={marks.length} tick={latest} active={shown} spread={hover !== null || dragging} />
          <div
            className="pointer-events-none absolute left-0 z-10 hidden -translate-y-full transition-all duration-500 ease-out-quint sm:block"
            style={{ top: pct(geo.plane(shown).middle) }}
          >
            <BlockTag number={blockOf(shown)} label={marks[shown]!.label} live={shown === 0} unavailable={isError} />
          </div>
          <span
            className={cn(
              "pointer-events-none absolute z-10 hidden -translate-y-full border border-lilac-400 bg-lilac-100 px-1.5 py-0.5 font-mono text-micro uppercase text-ink-900 transition-opacity duration-300",
              shown === 0 ? "sm:block" : "opacity-0",
            )}
            style={cluster}
          >
            Your contract lands here
          </span>
        </div>

        <div
          ref={axis}
          className={cn("relative w-28 touch-none sm:w-36", dragging ? "cursor-grabbing" : "cursor-ns-resize")}
          onPointerDown={onAxisDown}
          onPointerMove={onAxisMove}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
        >
          <span
            aria-hidden
            className="absolute left-0 w-px bg-ink-900/20"
            style={{ top: pct(geo.plane(0).middle - 0.04), bottom: pct(1 - geo.plane(marks.length - 1).middle - 0.04) }}
          />
          <span
            aria-hidden
            className="absolute left-0 z-10 h-6 w-1.5 -translate-x-1/2 -translate-y-1/2 bg-ink-900 transition-all duration-300 ease-out-quint"
            style={{ top: pct(geo.plane(shown).middle) }}
          />
          <ol aria-label="Recent blocks" onKeyDown={onKey}>
            {marks.map((m, i) => {
              const n = blockOf(i);
              const on = shown === i;
              return (
                <li key={m.label} className="absolute left-0 -translate-y-1/2" style={{ top: pct(geo.plane(i).middle) }}>
                  <span aria-hidden className={cn("absolute top-1/2 left-0 h-px -translate-y-1/2 bg-ink-900/40", i === 0 ? "w-4" : "w-2.5")} />
                  <button
                    type="button"
                    aria-pressed={on}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setActive(i)}
                    onPointerEnter={() => setHover(i)}
                    onFocus={() => setActive(i)}
                    className={cn(
                      "ml-6 flex cursor-pointer flex-col items-start gap-0.5 px-1.5 py-1 text-left transition-colors duration-200",
                      on ? "bg-ink-900 text-paper-50" : "text-ink-500 hover:text-ink-900",
                    )}
                  >
                    <span className="font-mono text-micro uppercase">{m.label}</span>
                    <span className={cn("font-mono text-mono tabular-nums", on ? "text-paper-50" : "text-ink-900")}>
                      {n !== undefined ? `#${formatNumber(n)}` : isError ? "—" : <Skeleton className="h-3 w-20" />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="absolute bottom-0 left-3 flex items-center gap-2 sm:left-6">
            <StatusDot status={isError ? "idle" : "live"} pulse={!isError && latest !== undefined} />
            <span className="font-mono text-micro uppercase whitespace-nowrap text-ink-500">
              {isError ? "RPC not responding" : `${liveNetwork.shortName} · ${liveNetwork.chainId}`}
            </span>
          </p>
        </div>
      </div>
      <div className="sm:hidden">
        <BlockTag number={blockOf(shown)} label={marks[shown]!.label} live={shown === 0} unavailable={isError} />
      </div>
    </div>
  );
}
