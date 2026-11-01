import { z } from "zod";
import { byteLength } from "@/lib/format";
import { defineTemplate } from "../defineTemplate";
import { DAY, formatLocal, futureDateTime, localDateTime, text, toUnix } from "../fields";

const option = z
  .string()
  .transform((s) => s.trim())
  .refine((s) => s.length > 0, { message: "Every option needs a label." })
  .refine((s) => byteLength(s) <= 48, { message: "Keep options under 48 bytes." });

export const poll = defineTemplate({
  id: 2,
  slug: "poll",
  title: "Poll",
  icon: "bars",
  category: "COMMUNITY",
  useCase: "A quick community vote: one wallet, one vote, results live.",
  description: "Ask a question with 2–6 options. Each wallet votes once before the end time. You can close it early.",
  schema: z.object({
    question: text("Question", 120),
    options: z
      .array(option)
      .min(2, { message: "Add at least 2 options." })
      .max(6, { message: "6 options max." })
      .refine((opts) => new Set(opts.map((o) => o.toLowerCase())).size === opts.length, { message: "Options must be different." }),
    endsAt: futureDateTime("End time"),
  }),
  fields: [
    { kind: "text", name: "question", label: "Question", placeholder: "What should we build next?", maxBytes: 120 },
    {
      kind: "list",
      name: "options",
      label: "Options",
      min: 2,
      max: 6,
      maxBytes: 48,
      addLabel: "Add option",
      placeholder: (i) => ["Wallet", "Explorer", "Game", "DEX", "Bridge", "Something else"][i] ?? `Option ${i + 1}`,
    },
    { kind: "datetime", name: "endsAt", label: "Ends on", hint: "Voting stops at this time. Your local timezone." },
  ],
  defaults: () => ({ question: "", options: ["", ""], endsAt: localDateTime(7 * DAY) }),
  toArgs: (v) => [v.question, v.options, toUnix(v.endsAt)],
  argNames: ["question", "options_", "endsAt_"],
  summary: (v) => [
    { label: "Question", value: v.question },
    { label: "Options", value: v.options.join(" · ") },
    { label: "Ends on", value: formatLocal(v.endsAt) },
    { label: "Who can vote", value: "Anyone, once per wallet" },
  ],
  feedName: (v) => v.question,
  readArgs: async (c) => [await c.getFunction("name")(), [...(await c.getFunction("getOptions")())], await c.getFunction("endsAt")()],
  errors: {
    PollClosed: "This poll is closed.",
    AlreadyVoted: "This wallet already voted.",
    InvalidOption: "That option doesn't exist.",
    NotOwner: "Only the poll's owner can do that.",
    BadOptions: "A poll needs 2–6 options.",
    EndInPast: "The end time has to be in the future.",
    EmptyText: "Text can't be empty.",
    TextTooLong: "That text is too long.",
  },
});
