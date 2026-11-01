import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { MyLaunchesView } from "./MyLaunchesView";

export const myLaunchesMetadata: Metadata = { title: "My launches" };

export function MyLaunchesPage() {
  return (
    <main className="pt-28 pb-24 md:pt-36">
      <Container>
        <MyLaunchesView />
      </Container>
    </main>
  );
}
