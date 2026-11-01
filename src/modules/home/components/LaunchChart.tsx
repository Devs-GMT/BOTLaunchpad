"use client";

import { Kicker, Skeleton } from "@/components/ui";
import { formatNumber } from "@/lib/format";
import { allTemplates } from "@/templates";
import { useRegistryStats } from "@/web3";
import { liveNetwork } from "../liveNetwork";

const axisLabel: Record<string, string> = { todo: "To-do", "check-in": "Check-in" };

/** One series (launches per template) from `stats()`: single ink hue, direct labels, a table for screen readers. */
export function LaunchChart() {
  const { data, isPending, isError } = useRegistryStats(liveNetwork);
  const rows = allTemplates.map((t) => ({ slug: t.slug, title: t.title, label: axisLabel[t.slug] ?? t.title, count: data?.perTemplate[t.id - 1] ?? 0 }));
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
      <div className="flex flex-col gap-3 lg:col-span-4">
        <Kicker>Contracts launched · {liveNetwork.shortName}</Kicker>
        <span className="text-hero-sm tabular-nums md:text-hero">
          {data ? formatNumber(data.total) : isError ? "—" : <Skeleton className="h-14 w-32" />}
        </span>
        <p className="max-w-prose text-small text-ink-500">
          {isError
            ? "The registry isn't answering right now. Numbers will show up once it does."
            : "Every listed launch, counted on chain by the Launchpad registry. Nothing here is typed in by hand."}
        </p>
      </div>

      <figure className="lg:col-span-8">
        <div className="relative flex h-64 items-end gap-3 border-b border-ink-900/25 sm:gap-6" aria-hidden>
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <span key={f} className="absolute inset-x-0 border-t border-dashed border-ink-900/8" style={{ bottom: `${f * 100}%` }} />
          ))}
          {rows.map((r) => (
            <div key={r.slug} className="group relative flex h-full flex-1 flex-col items-center justify-end">
              {isPending ? (
                <Skeleton className="h-1/3 w-6" />
              ) : (
                <>
                  <span className="mb-2 font-mono text-mono tabular-nums text-ink-900">{data ? formatNumber(r.count) : "—"}</span>
                  <span
                    className="w-6 rounded-t-xs bg-ink-900 transition-colors group-hover:bg-ink-700 sm:w-8"
                    style={{ height: r.count ? `${(r.count / max) * 82}%` : "1px" }}
                  />
                  <span className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap border border-ink-900/12 bg-paper-0 px-2 py-1 font-mono text-micro uppercase text-ink-700 group-hover:block">
                    {r.title} · {formatNumber(r.count)} {r.count === 1 ? "launch" : "launches"}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-3 sm:gap-6" aria-hidden>
          {rows.map((r) => (
            <span key={r.slug} className="flex-1 text-center font-mono text-micro uppercase text-ink-500">
              {r.label}
            </span>
          ))}
        </div>
        <figcaption className="sr-only">Launches per template on {liveNetwork.name}</figcaption>
        {data && (
          <table className="sr-only">
            <thead>
              <tr>
                <th>Template</th>
                <th>Launches</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.slug}>
                  <td>{r.title}</td>
                  <td>{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </figure>
    </div>
  );
}
