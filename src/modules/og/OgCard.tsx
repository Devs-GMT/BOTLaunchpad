import { ImageResponse } from "next/og";

// ImageResponse renders inline styles only, so the @theme tokens it needs are mirrored here (globals.css).
const t = {
  paper: "#f7f7f5",
  paper0: "#ffffff",
  line: "rgba(25,19,16,0.12)",
  ink: "#191310",
  muted: "#736761",
  dot: "rgba(25,19,16,0.22)",
  lilac: "#b0a7f5",
} as const;

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

function Logo({ size }: { size: number }) {
  const cell = size / 3;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", width: size, height: size }}>
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} style={{ width: cell, height: cell, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              width: cell * 0.62,
              height: cell * 0.62,
              background: i === 2 ? t.lilac : t.ink,
              marginTop: i === 2 ? -Math.round(cell / 2) : 0,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function Dots() {
  const rows = 9;
  const cols = 9;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} style={{ display: "flex", gap: 22 }}>
          {Array.from({ length: cols }, (_, c) => {
            const yours = r >= 2 && r <= 4 && c >= 5 && c <= 7;
            return <div key={c} style={{ width: 8, height: 8, borderRadius: 4, background: yours ? t.lilac : t.dot }} />;
          })}
        </div>
      ))}
    </div>
  );
}

export interface OgCardProps {
  kicker: string;
  lines: [string, string];
  footer: string;
}

/** 1200×630 share card in the Paper & Ledger style: mono kicker, two-tone headline, dot block. */
export function ogCard({ kicker, lines, footer }: OgCardProps) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: t.paper, padding: 64, color: t.ink }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingRight: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Logo size={40} />
            <span style={{ fontSize: 30, fontWeight: 500 }}>BOT Launchpad</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <span style={{ fontSize: 20, letterSpacing: 2, textTransform: "uppercase", color: t.muted }}>{kicker}</span>
            <span style={{ fontSize: 64, lineHeight: 1.05, letterSpacing: -2, fontWeight: 500 }}>{lines[0]}</span>
            <span style={{ fontSize: 64, lineHeight: 1.05, letterSpacing: -2, fontWeight: 500, color: t.muted }}>{lines[1]}</span>
          </div>
          <span style={{ fontSize: 20, letterSpacing: 2, textTransform: "uppercase", color: t.muted }}>{footer}</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 360,
            border: `1px solid ${t.line}`,
            background: t.paper0,
          }}
        >
          <Dots />
        </div>
      </div>
    ),
    ogSize,
  );
}
