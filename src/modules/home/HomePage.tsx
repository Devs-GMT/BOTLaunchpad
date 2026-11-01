export function HomePage() {
  return (
    <main className="mx-auto w-full max-w-rail-wide flex-1 px-4 pt-40 md:px-8 lg:px-16">
      <p className="font-mono text-mono uppercase text-ink-500">▪ BOT Launchpad · P0</p>
      <h1 className="mt-6 text-hero-sm md:text-h1 lg:text-hero">
        Your first contract
        <br />
        <span className="text-ink-600">is one click away.</span>
      </h1>
      <p className="mt-6 max-w-prose text-body-lg text-ink-500">
        Pick a template, fill a short form, confirm in MetaMask. A real smart contract on BOT Chain, owned by you.
      </p>
    </main>
  );
}
