import { cn } from "@/lib/cn";

const sizes = {
  hero: "text-hero-sm md:text-h1 lg:text-hero",
  h1: "text-h2-sm md:text-h1",
  h2: "text-h2-sm md:text-h2",
  h3: "text-h3",
} as const;

export interface TwoToneHeadingProps {
  as?: "h1" | "h2" | "h3";
  size?: keyof typeof sizes;
  /** First line is ink; every following line is muted. */
  lines: readonly [string, ...string[]];
  tone?: "light" | "dark";
  className?: string;
  id?: string;
}

export function TwoToneHeading({ as: Tag = "h2", size = "h2", lines, tone = "light", className, id }: TwoToneHeadingProps) {
  const [first, ...rest] = lines;
  return (
    <Tag id={id} className={cn(sizes[size], tone === "light" ? "text-ink-900" : "text-paper-50", className)}>
      <span className="block">{first}</span>
      {rest.map((line) => (
        <span key={line} className={cn("block", tone === "light" ? "text-ink-500" : "text-paper-700")}>
          {line}
        </span>
      ))}
    </Tag>
  );
}
