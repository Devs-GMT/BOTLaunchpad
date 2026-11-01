import { z } from "zod";
import { defineTemplate } from "../defineTemplate";
import { text } from "../fields";

export const guestbook = defineTemplate({
  id: 1,
  slug: "guestbook",
  title: "Guestbook",
  icon: "book",
  category: "COMMUNITY",
  useCase: "An “I was here” wall for an event, a booth or a launch.",
  description: "Anyone can sign once with a short message. Messages live on-chain forever, newest first on the Interact page.",
  schema: z.object({ title: text("Title", 64) }),
  fields: [{ kind: "text", name: "title", label: "Title", placeholder: "Devcon booth guestbook", maxBytes: 64 }],
  defaults: () => ({ title: "" }),
  toArgs: (v) => [v.title],
  argNames: ["name_"],
  summary: (v) => [
    { label: "Title", value: v.title },
    { label: "Who can sign", value: "Anyone, once per wallet" },
    { label: "Message length", value: "Up to 140 bytes" },
  ],
  feedName: (v) => v.title,
  readArgs: async (c) => [await c.getFunction("name")()],
  errors: {
    AlreadySigned: "This wallet already signed the guestbook.",
    EmptyText: "Write a message first.",
    TextTooLong: "That message is too long (140 bytes max).",
  },
});
