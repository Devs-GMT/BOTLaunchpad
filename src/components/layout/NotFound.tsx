import Link from "next/link";

export function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-rail flex-1 flex-col justify-center px-4 py-32 md:px-8 lg:px-16">
      <p className="font-mono text-mono uppercase text-ink-500">404 · Not found</p>
      <h1 className="mt-4 text-h2">
        Nothing was deployed here.
        <br />
        <span className="text-ink-600">Try the launchpad instead.</span>
      </h1>
      <Link href="/" className="mt-8 font-mono text-mono uppercase text-ink-900 underline underline-offset-4">
        Back home →
      </Link>
    </main>
  );
}
