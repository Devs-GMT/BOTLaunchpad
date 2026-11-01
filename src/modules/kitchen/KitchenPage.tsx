import { notFound } from "next/navigation";
import { KitchenDemo } from "./KitchenDemo";

/** Dev-only gallery of every UI primitive. Removed before launch (BUILD_PLAN P9). */
export function KitchenPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <KitchenDemo />;
}
