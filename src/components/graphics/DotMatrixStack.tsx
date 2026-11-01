import { cn } from "@/lib/cn";
import { hash01 } from "./random";

export interface DotMatrixStackProps {
  /** Number of stacked planes (blocks). Plane 0 is the top one and holds "your contract". */
  planes?: number;
  /** Dots per plane edge. */
  grid?: number;
  /** Changing this replays the mint "new block" flash on the top plane. */
  tick?: number | bigint;
  /** Plane lifted out of the stack. */
  active?: number;
  /** Planes fan out a little (e.g. while the pointer is over the stack). */
  spread?: boolean;
  onActivate?: (plane: number) => void;
  animate?: boolean;
  className?: string;
}

const DX = 10;
const DY = DX * Math.tan(Math.PI / 6); // true isometric
const GAP = 46;
const LIFT = 16;
const FAN = 9;

function iso(i: number, j: number, cx: number, top: number) {
  return { x: cx + (i - j) * DX, y: top + (i + j) * DY };
}

/** Size of the stack's viewBox and where each plane sits in it, as fractions (for HTML overlays). */
export function stackGeometry(planes = 4, grid = 10) {
  const cx = grid * DX + 4;
  const width = cx * 2;
  const planeH = grid * 2 * DY;
  const height = planeH + (planes - 1) * GAP + 8 + LIFT;
  const plane = (p: number) => {
    const top = 4 + LIFT + p * GAP;
    return { top: top / height, middle: (top + planeH / 2) / height, left: 4 / width, right: (width - 4) / width };
  };
  return { cx, width, height, planeH, plane };
}

/**
 * Isometric stack of translucent dot planes = blocks on BOT Chain.
 * A lilac cluster on the top plane is the user's new contract. The active plane lifts out of the stack.
 */
export function DotMatrixStack({
  planes = 4,
  grid = 10,
  tick,
  active,
  spread,
  onActivate,
  animate = true,
  className,
}: DotMatrixStackProps) {
  const { cx, width, height } = stackGeometry(planes, grid);
  const interactive = Boolean(onActivate);

  const layers = [];
  // Draw bottom first so upper planes overlap lower ones.
  for (let p = planes - 1; p >= 0; p--) {
    const top = 4 + LIFT + p * GAP;
    const isTop = p === 0;
    const isActive = active === p;
    const dimmed = active !== undefined && !isActive;
    const a = iso(0, 0, cx, top);
    const b = iso(grid, 0, cx, top);
    const c = iso(grid, grid, cx, top);
    const d = iso(0, grid, cx, top);
    const dots = [];
    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        const { x, y } = iso(i + 0.5, j + 0.5, cx, top);
        const r = hash01(p, i, j);
        const inCluster = isTop && i >= 5 && i <= 7 && j >= 2 && j <= 4;
        let cls = isActive ? "fill-ink-900/45" : "fill-ink-900/25";
        if (inCluster) cls = r > 0.25 ? "fill-lilac-400" : "fill-lilac-300";
        else if (r > 0.94) cls = "fill-teal-300";
        else if (r > 0.9 && !isTop) cls = "fill-mint-500/70";
        else if (r < 0.18) cls = "fill-ink-900/10";
        const twinkle = animate && (inCluster ? r > 0.55 : r > 0.86);
        dots.push(
          <circle
            key={`${i}-${j}`}
            cx={x}
            cy={y}
            r={inCluster ? 2.1 : isActive ? 1.8 : 1.6}
            className={cn(cls, "transition-colors duration-300", twinkle && "animate-twinkle")}
            style={twinkle ? { animationDelay: `${(r * 6).toFixed(2)}s` } : undefined}
          />,
        );
      }
    }
    const lift = (isActive ? -LIFT : 0) + (spread ? (p - (planes - 1) / 2) * FAN : 0);
    layers.push(
      <g
        key={p}
        className={cn(animate && "animate-breathe")}
        style={animate ? { animationDelay: `${p * -1.7}s` } : undefined}
      >
        <g
          className={cn("transition-all duration-500 ease-out-quint", dimmed && "opacity-55", interactive && "cursor-pointer")}
          style={{ transform: `translateY(${lift}px)` }}
          onPointerEnter={onActivate ? () => onActivate(p) : undefined}
          onClick={onActivate ? () => onActivate(p) : undefined}
        >
          <path
            d={`M${a.x} ${a.y}L${b.x} ${b.y}L${c.x} ${c.y}L${d.x} ${d.y}Z`}
            className={cn(
              "transition-colors duration-300",
              isActive ? "fill-paper-0 stroke-ink-900/40" : isTop ? "fill-paper-0/90 stroke-ink-900/15" : "fill-paper-0/60 stroke-ink-900/15",
            )}
            strokeWidth={0.75}
          />
          {dots}
          {isTop && tick !== undefined && (
            <g key={String(tick)} className="animate-flash">
              {Array.from({ length: grid }, (_, k) => {
                const { x, y } = iso(k + 0.5, grid - 0.5, cx, top);
                return <circle key={k} cx={x} cy={y} r={2} className="fill-mint-500" />;
              })}
            </g>
          )}
        </g>
      </g>,
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("h-auto w-full overflow-visible", className)} aria-hidden>
      {layers}
    </svg>
  );
}
