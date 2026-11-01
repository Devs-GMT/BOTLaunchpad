import { cn } from "@/lib/cn";
import { LogoMark } from "./LogoMark";

/** Giant logo + wordmark spanning the footer, cropped by the page edge. */
export function Watermark({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none flex select-none items-end gap-4 overflow-hidden md:gap-8 text-coal-700", className)}>
      <LogoMark className="h-auto w-1/8" accentClassName="fill-coal-700" />
      <svg viewBox="0 0 860 150" className="h-auto w-7/8 translate-y-1/5">
        <text x="0" y="140" textLength="860" lengthAdjust="spacingAndGlyphs" className="fill-current font-sans font-medium" fontSize="190" letterSpacing="-6">
          Launchpad
        </text>
      </svg>
    </div>
  );
}
