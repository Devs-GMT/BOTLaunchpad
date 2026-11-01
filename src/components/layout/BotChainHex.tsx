import { cn } from "@/lib/cn";

/** Plain hexagon mark standing in for "BOT Chain" (we don't ship their logo file). */
export function BotChainHex({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("shrink-0", className)} aria-hidden>
      <path d="M12 1.5 21.1 6.75v10.5L12 22.5 2.9 17.25V6.75Z" className="fill-none stroke-current" strokeWidth={1.5} />
    </svg>
  );
}
