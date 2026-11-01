"use client";

import { useEffect, useState } from "react";

/** Unix seconds, refreshed every `everyMs` so time-based states (opens in…, ended, 3m ago) update on their own. */
export function useNow(everyMs = 15_000) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), everyMs);
    return () => clearInterval(t);
  }, [everyMs]);
  return now;
}
