import { z } from "zod";
import { defineTemplate } from "../defineTemplate";
import { text } from "../fields";

export const tipJar = defineTemplate({
  id: 4,
  slug: "tip-jar",
  title: "Tip Jar",
  icon: "coin",
  category: "CREATORS",
  useCase: "Let supporters send BOT with a note. Only you can withdraw.",
  description: "Tips of 0.001 BOT or more, each with an optional note. The balance can only go to your wallet. Don't use it for large amounts.",
  schema: z.object({
    name: text("Name", 64),
    thankYou: text("Thank-you message", 140, { optional: true }),
  }),
  fields: [
    { kind: "text", name: "name", label: "Name", placeholder: "Ayu's pixel art", maxBytes: 64 },
    {
      kind: "textarea",
      name: "thankYou",
      label: "Thank-you message",
      placeholder: "Thank you for the support!",
      maxBytes: 140,
      hint: "Shown to people before they tip. Optional.",
    },
  ],
  defaults: () => ({ name: "", thankYou: "" }),
  toArgs: (v) => [v.name, v.thankYou],
  argNames: ["name_", "thankYou_"],
  summary: (v) => [
    { label: "Name", value: v.name },
    { label: "Thank-you message", value: v.thankYou || "—" },
    { label: "Minimum tip", value: "0.001 BOT" },
    { label: "Who can withdraw", value: "Only you" },
  ],
  feedName: (v) => v.name,
  errors: {
    TipTooSmall: "The minimum tip is 0.001 BOT.",
    NotOwner: "Only the owner can withdraw.",
    NothingToWithdraw: "There's nothing to withdraw yet.",
    TransferFailed: "The withdrawal couldn't be sent to the owner's wallet.",
    TextTooLong: "That note is too long (140 bytes max).",
  },
});
