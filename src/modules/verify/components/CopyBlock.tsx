import { CopyButton, Kicker } from "@/components/ui";
import { cn } from "@/lib/cn";

export interface CopyBlockProps {
  label: string;
  value: string;
  hint?: string;
  /** Clamp tall values and let them scroll. */
  scroll?: boolean;
  id?: string;
}

/** Labelled mono value with a copy button. */
export function CopyBlock({ label, value, hint, scroll, id }: CopyBlockProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <Kicker>{label}</Kicker>
        <CopyButton value={value} />
      </div>
      <pre
        id={id}
        className={cn(
          "border border-ink-900/12 bg-paper-0 p-4 font-mono text-mono break-all whitespace-pre-wrap text-ink-900",
          scroll && "max-h-48 overflow-auto",
        )}
      >
        {value || "—"}
      </pre>
      {hint && <p className="text-small text-ink-500">{hint}</p>}
    </div>
  );
}
