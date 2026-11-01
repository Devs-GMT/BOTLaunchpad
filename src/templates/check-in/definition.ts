import { z } from "zod";
import { defineTemplate } from "../defineTemplate";
import { HOUR, formatLocal, futureDateTime, localDateTime, text, toUnix } from "../fields";

export const checkIn = defineTemplate({
  id: 5,
  slug: "check-in",
  title: "Event Check-in",
  icon: "pin",
  category: "EVENTS",
  useCase: "Proof of attendance for meetups and workshops, no NFTs needed.",
  description: "Attendees check in once with their wallet while the window is open, up to a cap you choose.",
  schema: z
    .object({
      name: text("Event name", 64),
      startsAt: z.string().min(1, { message: "Pick a start time." }),
      endsAt: futureDateTime("End time"),
      maxAttendees: z.coerce
        .number<string | number>({ message: "Enter a number." })
        .int({ message: "Use a whole number." })
        .min(1, { message: "At least 1 attendee." })
        .max(10_000, { message: "10,000 max." }),
    })
    .refine((v) => new Date(v.startsAt).getTime() < new Date(v.endsAt).getTime(), {
      message: "Check-in must open before it closes.",
      path: ["endsAt"],
    }),
  fields: [
    { kind: "text", name: "name", label: "Event name", placeholder: "BOT Chain Jakarta Meetup", maxBytes: 64 },
    { kind: "datetime", name: "startsAt", label: "Check-in opens", hint: "Your local timezone." },
    { kind: "datetime", name: "endsAt", label: "Check-in closes" },
    { kind: "number", name: "maxAttendees", label: "Max attendees", min: 1, max: 10_000, placeholder: "200" },
  ],
  defaults: () => ({ name: "", startsAt: localDateTime(0), endsAt: localDateTime(4 * HOUR), maxAttendees: 100 }),
  toArgs: (v) => [v.name, toUnix(v.startsAt), toUnix(v.endsAt), v.maxAttendees],
  argNames: ["name_", "startsAt_", "endsAt_", "maxAttendees_"],
  summary: (v) => [
    { label: "Event name", value: v.name },
    { label: "Check-in opens", value: formatLocal(v.startsAt) },
    { label: "Check-in closes", value: formatLocal(v.endsAt) },
    { label: "Max attendees", value: v.maxAttendees.toLocaleString("en-US") },
  ],
  feedName: (v) => v.name,
  readArgs: async (c) =>
    Promise.all(["name", "startsAt", "endsAt", "maxAttendees"].map((fn) => c.getFunction(fn)())),
  errors: {
    NotStarted: "Check-in hasn't opened yet.",
    Ended: "Check-in has closed.",
    Full: "This event is full.",
    AlreadyCheckedIn: "This wallet already checked in.",
    BadWindow: "Check-in must open before it closes, and close in the future.",
    BadMax: "Max attendees must be between 1 and 10,000.",
  },
});
