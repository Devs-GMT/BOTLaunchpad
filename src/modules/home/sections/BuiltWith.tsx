import { PixelIcon, type PixelIconName } from "@/components/graphics";
import { Container, DashedBox, Kicker } from "@/components/ui";

const groups: { label: string; items: { name: string; icon: PixelIconName }[] }[] = [
  {
    label: "Built with",
    items: [
      { name: "Solidity", icon: "code" },
      { name: "ethers.js", icon: "list" },
      { name: "MetaMask", icon: "wallet" },
    ],
  },
  {
    label: "Runs on",
    items: [
      { name: "BOT Chain Mainnet", icon: "map" },
      { name: "BOT Chain Testnet", icon: "pin" },
    ],
  },
];

export function BuiltWith() {
  return (
    <section className="border-y border-ink-900/10 py-8">
      <Container rail="wide" className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {groups.map((g) => (
          <div key={g.label} className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <Kicker className="shrink-0 md:w-24">{g.label}</Kicker>
            <ul className="flex min-w-0 flex-1 flex-wrap gap-2">
              {g.items.map((item) => (
                <li key={item.name} className="contents">
                  <DashedBox size="chip" className="text-small text-ink-700">
                    <PixelIcon name={item.icon} cell={2} className="text-ink-500" />
                    {item.name}
                  </DashedBox>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
    </section>
  );
}
