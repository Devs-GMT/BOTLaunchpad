"use client";

import { useEffect, useState } from "react";
import { Chip, CopyButton, Skeleton } from "@/components/ui";

// Palette-matched TextMate theme. Teal for keywords (action), lilac is reserved for the user's values.
const theme = {
  name: "launchpad-coal",
  type: "dark" as const,
  colors: { "editor.background": "#211f1b", "editor.foreground": "#e6e5de" },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#7c7a76", fontStyle: "italic" } },
    { scope: ["keyword", "storage", "storage.type", "storage.modifier"], settings: { foreground: "#93cdd7" } },
    { scope: ["string", "string.quoted"], settings: { foreground: "#c2bfaf" } },
    { scope: ["constant.numeric", "constant.language"], settings: { foreground: "#67b470" } },
    { scope: ["entity.name.function", "support.function"], settings: { foreground: "#fbfbfa" } },
    { scope: ["entity.name.type", "support.type", "entity.name.class"], settings: { foreground: "#78a1a6" } },
  ],
};

let highlighter: Promise<{ codeToHtml: (code: string, opts: { lang: string; theme: string }) => string }> | null = null;

function getHighlighter() {
  highlighter ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
    ]);
    const hl = await createHighlighterCore({
      langs: [import("shiki/langs/solidity.mjs")],
      themes: [theme],
      engine: createJavaScriptRegexEngine(),
    });
    return hl;
  })();
  return highlighter;
}

/** Read-only Solidity source, highlighted on the client (shiki loads only when this mounts). */
export function CodeView({ source, fileName }: { source: string; fileName: string }) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHighlighter().then((hl) => {
      if (!cancelled) setHtml(hl.codeToHtml(source, { lang: "solidity", theme: theme.name }));
    });
    return () => {
      cancelled = true;
    };
  }, [source]);

  return (
    <div className="border border-ink-900/12 bg-coal-900">
      <div className="flex items-center justify-between border-b border-paper-0/10 px-3 py-2">
        <Chip tone="coal" label={fileName} meta="read-only" />
        <CopyButton value={source} tone="dark" label="Copy source" />
      </div>
      <div className="max-h-120 overflow-auto p-4 font-mono text-mono leading-relaxed">
        {html ? (
          // Highlighted from our own compiled source, never user input.
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 12 }, (_, i) => (
              <Skeleton key={i} className="h-3 w-3/4 bg-coal-800" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
