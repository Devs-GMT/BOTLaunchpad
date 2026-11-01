import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./Container";

const tones = {
  paper: "bg-paper-100 text-ink-900",
  soft: "bg-paper-200 text-ink-900",
  coal: "bg-coal-900 text-paper-50",
} as const;

export type SectionProps = ComponentProps<"section"> & {
  tone?: keyof typeof tones;
  rail?: "default" | "wide";
  /** Faint 24px pixel grid behind the content. */
  grid?: boolean;
  /** Skip vertical padding (for sections that manage their own). */
  flush?: boolean;
  containerClassName?: string;
};

export function Section({
  tone = "paper",
  rail = "default",
  grid,
  flush,
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "relative",
        tones[tone],
        !flush && "section-y",
        grid && (tone === "coal" ? "pixel-grid-dark" : "pixel-grid"),
        className,
      )}
      {...props}
    >
      <Container rail={rail} className={containerClassName}>
        {children}
      </Container>
    </section>
  );
}
