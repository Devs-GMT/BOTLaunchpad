import { z } from "zod";
import { defineTemplate } from "../defineTemplate";
import { text } from "../fields";

export const todo = defineTemplate({
  id: 3,
  slug: "todo",
  title: "To-do Board",
  icon: "list",
  category: "TEAMS",
  useCase: "A shared task list for a hackathon team or a small crew.",
  description: "Add tasks and tick them off. Decide whether only you or anyone can add tasks. Creators and you can toggle them.",
  schema: z.object({
    name: text("Board name", 64),
    access: z.enum(["owner", "anyone"]),
  }),
  fields: [
    { kind: "text", name: "name", label: "Board name", placeholder: "Hackathon team board", maxBytes: 64 },
    {
      kind: "segmented",
      name: "access",
      label: "Who can add tasks",
      options: [
        { value: "owner", label: "Only me" },
        { value: "anyone", label: "Anyone" },
      ],
      hint: "This can't be changed after launch.",
    },
  ],
  defaults: () => ({ name: "", access: "anyone" as const }),
  toArgs: (v) => [v.name, v.access === "anyone"],
  argNames: ["name_", "openToAll_"],
  summary: (v) => [
    { label: "Board name", value: v.name },
    { label: "Who can add tasks", value: v.access === "anyone" ? "Anyone" : "Only me" },
    { label: "Who can tick tasks", value: "You, or the wallet that added the task" },
  ],
  feedName: (v) => v.name,
  readArgs: async (c) => [await c.getFunction("name")(), await c.getFunction("openToAll")()],
  errors: {
    NotAllowed: "This wallet isn't allowed to do that on this board.",
    NoSuchTask: "That task doesn't exist.",
    EmptyText: "Write the task first.",
    TextTooLong: "That task is too long (120 bytes max).",
  },
});
