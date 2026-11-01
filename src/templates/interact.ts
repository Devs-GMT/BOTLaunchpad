"use client";

import dynamic from "next/dynamic";
import { createElement } from "react";
import { Skeleton } from "@/components/ui";
import type { InteractComponent, TemplateSlug } from "./types";

const loading = () => createElement(Skeleton, { className: "h-80 w-full" });

/** Interact UIs, code-split so only the contract page loads them. */
export const interactBySlug: Record<TemplateSlug, InteractComponent> = {
  guestbook: dynamic(() => import("./guestbook/GuestbookInteract"), { loading }),
  poll: dynamic(() => import("./poll/PollInteract"), { loading }),
  todo: dynamic(() => import("./todo/TodoInteract"), { loading }),
  "tip-jar": dynamic(() => import("./tip-jar/TipJarInteract"), { loading }),
  "check-in": dynamic(() => import("./check-in/CheckInInteract"), { loading }),
};
