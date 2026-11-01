import { cn } from "@/lib/cn";
import { hash01 } from "./random";

type LonLat = readonly [number, number];

// Deliberately coarse continent outlines (lon, lat). Rasterised to dots, so precision doesn't matter.
const LAND: readonly (readonly LonLat[])[] = [
  // North America
  [[-168, 66], [-140, 70], [-95, 72], [-80, 64], [-62, 58], [-56, 50], [-66, 44], [-75, 35], [-81, 25], [-97, 26], [-97, 18], [-87, 14], [-80, 8], [-90, 15], [-105, 20], [-117, 32], [-124, 40], [-125, 49], [-135, 58], [-150, 60], [-165, 60]],
  // Greenland
  [[-55, 60], [-42, 60], [-20, 70], [-20, 80], [-45, 83], [-70, 78], [-58, 70]],
  // South America
  [[-80, 8], [-62, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -28], [-58, -38], [-65, -55], [-73, -50], [-72, -30], [-70, -18], [-81, -5]],
  // Europe
  [[-10, 36], [-9, 44], [-2, 48], [-5, 58], [5, 62], [10, 71], [30, 71], [40, 66], [40, 45], [28, 41], [20, 40], [12, 38], [3, 43]],
  // Great Britain
  [[-6, 50], [2, 51], [-2, 58], [-6, 58]],
  // Africa
  [[-17, 21], [-10, 35], [10, 37], [32, 31], [43, 12], [51, 12], [40, -5], [40, -16], [35, -25], [20, -35], [15, -28], [12, -5], [8, 4], [-8, 5], [-17, 14]],
  // Asia
  [[40, 45], [40, 66], [60, 70], [80, 73], [105, 78], [140, 72], [180, 68], [170, 60], [155, 58], [142, 52], [140, 40], [122, 30], [121, 22], [108, 18], [105, 10], [100, 2], [95, 15], [80, 8], [72, 20], [58, 25], [50, 30], [36, 32], [28, 41]],
  // Japan
  [[130, 31], [141, 36], [142, 45], [139, 41]],
  // Maritime Southeast Asia
  [[95, 5], [105, -6], [120, -9], [140, -8], [150, -6], [130, -2], [118, 6], [108, 2]],
  // Australia
  [[113, -22], [122, -18], [131, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [140, -38], [132, -32], [115, -34]],
];

function inside([x, y]: LonLat, poly: readonly LonLat[]) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

const COLS = 96;
const ROWS = 40;
const LAT_TOP = 80;
const LAT_BOTTOM = -58;

const cells: { col: number; row: number }[] = [];
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const lon = -180 + ((col + 0.5) / COLS) * 360;
    const lat = LAT_TOP - ((row + 0.5) / ROWS) * (LAT_TOP - LAT_BOTTOM);
    if (LAND.some((poly) => inside([lon, lat], poly))) cells.push({ col, row });
  }
}

function project([lon, lat]: LonLat) {
  return {
    col: Math.round(((lon + 180) / 360) * COLS - 0.5),
    row: Math.round(((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * ROWS - 0.5),
  };
}

export interface MapBeacon {
  at: LonLat;
  tone?: "teal" | "mint" | "lilac";
}

export interface DotWorldMapProps {
  beacons?: readonly MapBeacon[];
  tone?: "dark" | "light";
  className?: string;
}

const beaconFill = { teal: "fill-teal-300", mint: "fill-mint-500", lilac: "fill-lilac-400" } as const;

/** Dot-matrix world map for dark bands. */
export function DotWorldMap({ beacons = [], tone = "dark", className }: DotWorldMapProps) {
  return (
    <svg viewBox={`0 0 ${COLS} ${ROWS}`} className={cn("h-auto w-full", className)} aria-hidden>
      {cells.map(({ col, row }) => {
        const r = hash01(col, row);
        return (
          <circle
            key={`${col}-${row}`}
            cx={col + 0.5}
            cy={row + 0.5}
            r={0.28}
            className={tone === "dark" ? (r > 0.92 ? "fill-paper-0/35" : "fill-paper-0/15") : "fill-ink-900/20"}
          />
        );
      })}
      {beacons.map((b, i) => {
        const { col, row } = project(b.at);
        const fill = beaconFill[b.tone ?? "teal"];
        return (
          <g key={i}>
            <circle cx={col + 0.5} cy={row + 0.5} r={1.4} className={cn(fill, "animate-ping opacity-30")} style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: `${i * 0.6}s` }} />
            <circle cx={col + 0.5} cy={row + 0.5} r={0.45} className={fill} />
          </g>
        );
      })}
    </svg>
  );
}
