import { cn } from "@/lib/cn";

// Bitmaps: "#" = ink cell, "o" = accent cell, anything else = empty.
const bitmaps = {
  key: [
    "............",
    "..###.......",
    ".#ooo#......",
    ".#o#o########",
    ".#ooo#...#.#.",
    "..###....#.#.",
    "............",
  ],
  shield: [
    ".#########.",
    ".#.......#.",
    ".#...o...#.",
    ".#..ooo..#.",
    ".#...o...#.",
    ".#.......#.",
    "..#.....#..",
    "...#...#...",
    "....#.#....",
    ".....#.....",
  ],
  lock: [
    "...#####...",
    "..#.....#..",
    "..#.....#..",
    ".#########.",
    ".#.......#.",
    ".#...o...#.",
    ".#...o...#.",
    ".#.......#.",
    ".#########.",
  ],
  check: [
    "..........#",
    ".........#.",
    "........#..",
    ".o.....#...",
    "..o...#....",
    "...o.#.....",
    "....#......",
  ],
  wallet: [
    ".##########.",
    "#..........#",
    "#.......####",
    "#.......#oo#",
    "#.......####",
    "#..........#",
    ".##########.",
  ],
  code: [
    "...#....#...",
    "..#......#..",
    ".#...o....#.",
    "#....o.....#",
    ".#...o....#.",
    "..#......#..",
    "...#....#...",
  ],
  map: [
    "##...##...##",
    "#.#.#..#.#.#",
    "#..#....#..#",
    "#..#.oo.#..#",
    "#..#.oo.#..#",
    "#..#....#..#",
    "#.#.#..#.#.#",
    "##...##...##",
  ],
} as const;

export type PixelIconName = keyof typeof bitmaps;

export interface PixelIconProps {
  name: PixelIconName;
  /** Rendered size of one cell in px. */
  cell?: number;
  className?: string;
  accentClassName?: string;
  title?: string;
}

/** Pixel-dot icon drawn from a bitmap, so it stays crisp and themeable. */
export function PixelIcon({ name, cell = 3, className, accentClassName = "fill-lilac-400", title }: PixelIconProps) {
  const rows = bitmaps[name];
  const width = Math.max(...rows.map((r) => r.length));
  const cells = [];
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y] ?? "";
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c !== "#" && c !== "o") continue;
      cells.push(
        <rect
          key={`${x}-${y}`}
          x={x + 0.1}
          y={y + 0.1}
          width={0.8}
          height={0.8}
          className={c === "o" ? accentClassName : "fill-current"}
        />,
      );
    }
  }
  return (
    <svg
      width={width * cell}
      height={rows.length * cell}
      viewBox={`0 0 ${width} ${rows.length}`}
      className={cn("shrink-0", className)}
      shapeRendering="crispEdges"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {cells}
    </svg>
  );
}
