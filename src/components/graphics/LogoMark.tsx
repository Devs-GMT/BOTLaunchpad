import { cn } from "@/lib/cn";

export interface LogoMarkProps {
  /** Width in px. Omit to size with CSS (e.g. the footer watermark). */
  size?: number;
  className?: string;
  /** Colour of the lifted dot. Lilac by default: it is "your" contract. */
  accentClassName?: string;
  title?: string;
}

const STEP = 8;
const DOT = 5;

/** 3×3 dot launch glyph: eight ink dots, the top-right one lifted half a step and lilac. */
export function LogoMark({ size, className, accentClassName = "fill-lilac-400", title }: LogoMarkProps) {
  const dots = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const lifted = row === 0 && col === 2;
      dots.push(
        <rect
          key={`${row}-${col}`}
          x={col * STEP + 1.5}
          y={row * STEP + 5.5 - (lifted ? STEP / 2 : 0)}
          width={DOT}
          height={DOT}
          className={lifted ? accentClassName : "fill-current"}
        />,
      );
    }
  }
  return (
    <svg
      width={size}
      height={size === undefined ? undefined : (size * 28) / 24}
      viewBox="0 0 24 28"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {dots}
    </svg>
  );
}
