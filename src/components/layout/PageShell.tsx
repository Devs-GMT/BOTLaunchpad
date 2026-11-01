import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-ink-900 focus:px-3 focus:py-2 focus:text-paper-50">
        Skip to content
      </a>
      <Navbar />
      <div id="main" className="flex flex-1 flex-col">
        {children}
      </div>
      <Footer />
    </div>
  );
}
