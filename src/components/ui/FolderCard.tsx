import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  paper: { edge: "bg-ink-900/12", fill: "bg-paper-0" },
  soft: { edge: "bg-ink-900/10", fill: "bg-paper-200" },
  lilac: { edge: "bg-lilac-400", fill: "bg-lilac-200" },
  coal: { edge: "bg-paper-0/12", fill: "bg-coal-800" },
} as const;

export interface FolderCardProps {
  /** Content of the tab (top-left), usually a filename Chip or a Kicker. */
  tab?: ReactNode;
  /** Full-bleed media under the tab line (image, graphic). */
  media?: ReactNode;
  tone?: keyof typeof tones;
  /** Tab width as a share of the card width. */
  tabWidth?: `${number}%`;
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
}

/**
 * Folder silhouette: the tab runs along the top-left, then the top edge steps down through a 45° diagonal.
 * The hairline is a clipped edge layer behind a 1px-inset clipped fill, so the border follows the shape.
 */
export function FolderCard({
  tab,
  media,
  tone = "paper",
  tabWidth = "62%",
  className,
  bodyClassName,
  children,
}: FolderCardProps) {
  const t = tones[tone];
  const style = { "--folder-tab-w": tabWidth, "--folder-tab-h": "2.25rem" } as CSSProperties;
  return (
    <div className={cn("relative isolate flex flex-col", className)} style={style}>
      <div aria-hidden className={cn("folder-clip absolute inset-0 -z-10", t.edge)} />
      <div aria-hidden className={cn("folder-clip absolute inset-px -z-10", t.fill)} />
      <div className="flex h-9 items-center px-3" style={{ width: tabWidth }}>
        {tab}
      </div>
      {media && <div className="relative mx-px overflow-hidden">{media}</div>}
      {children && <div className={cn("flex flex-1 flex-col p-5", bodyClassName)}>{children}</div>}
    </div>
  );
}
