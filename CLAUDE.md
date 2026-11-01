# CLAUDE.md — BOT Launchpad

No-code smart-contract launcher for BOT Chain. A user picks one of 5 templates (Guestbook, Poll, To-do Board, Tip Jar, Event Check-in), fills a short form, and deploys it from the browser with MetaMask. The user's wallet is the deployer and owner. Every launch can be listed in an on-chain `LaunchpadRegistry`. Each contract gets an Interact page and a Verify helper. No backend, no API keys, no AI.

Read before working:
- [PRD.md](PRD.md): product scope, flows, copy, states. It is the source of truth for *what*.
- [docs/BUILD_PLAN.md](docs/BUILD_PLAN.md): phases, tasks, acceptance criteria. Tick boxes as you finish them.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): folder layout, module boundaries, data flow. Source of truth for *where*.
- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md): tokens, components, anti-slop rules. Source of truth for *how it looks*.
- [docs/CONTRACTS.md](docs/CONTRACTS.md): Solidity specs, the `templates.json` schema, networks.

## Stack

> Next.js 16.4 has breaking changes vs. older training data. Check `node_modules/next/dist/docs/` before using an unfamiliar API (see [AGENTS.md](AGENTS.md)). Cache Components + Partial Prefetching are on: wrap client components that read `useSearchParams`/`useParams` in `<Suspense>`.

- Next.js (latest stable, App Router), React 19, TypeScript `strict`
- Tailwind CSS v4: CSS-first `@theme` tokens in `src/styles/globals.css`. There is no `tailwind.config.*`.
- ethers v6 for chain access. TanStack Query for RPC reads. zod + react-hook-form for forms.
- shiki (lazy-loaded, client only) for Solidity code view
- Fonts via `next/font/google`: Host Grotesk (sans/display), JetBrains Mono (mono)
- Contracts: Hardhat (TypeScript) in its own package at `contracts/`. Solidity 0.8.20, optimizer on, 200 runs, `evmVersion: paris`.
- Package manager: pnpm (workspace: root app + `contracts`)
- Hosting: Vercel + custom domain. The app is client-rendered and has no API routes or server actions.

## Commands

```bash
pnpm install
pnpm dev                     # Next dev server
pnpm build && pnpm start     # production build
pnpm lint && pnpm typecheck  # must pass before a task is done

pnpm -C contracts compile
pnpm -C contracts test                       # all template + registry tests
pnpm -C contracts export                     # writes src/generated/templates.json
pnpm -C contracts deploy:registry --network botTestnet   # or botMainnet
```

## Architecture rules (non-negotiable)

1. **`app/` is routing only.** Every `app/**/page.tsx` imports one page component from `src/modules/<module>` and renders it. It may also export `metadata` / `generateMetadata` / `generateStaticParams`. Do not put JSX logic, hooks, fetching or styling in `app/`.
   ```tsx
   // app/launch/[template]/page.tsx
   import { LaunchWizardPage, launchStaticParams } from '@/modules/launch';
   export const generateStaticParams = launchStaticParams;
   export default LaunchWizardPage;
   ```
2. **`app/` and `src/` are siblings at the repo root.** The `@/*` alias points to `src/*`.
3. **Modules are features** (`home`, `launch`, `contract`, `verify`, `my-launches`). Each exposes a public API through `index.ts`. A module never imports another module's internals. Shared code moves *down* into `components/`, `templates/`, `web3/` or `lib/`.
4. **Dependency direction:** `app → modules → (templates, components, web3, lib, config)`. `components/ui` imports nothing app-specific: no web3, no templates.
5. **Templates are data + small adapters.** Each one lives in `src/templates/<slug>/` with one `definition.ts` (`defineTemplate({...})`). Add or change a template there, never with `if (slug === 'poll')` branches in modules.
6. **`src/generated/` is machine-written.** Never edit `templates.json` by hand. Re-run `pnpm -C contracts export`.
7. **Server vs client:** pages are client components only where they need wallet/RPC (`'use client'` at the module page level). Marketing sections without interactivity stay server components.

## Web3 rules

- Reads go through the per-network `JsonRpcProvider` (`web3/providers.ts`) and work without a wallet. Writes use the `BrowserProvider` from the connected wallet.
- Run every write through `useTxFlow`: `idle → signing → pending(hash) → confirmed | rejected | failed`. Always show the explorer tx link while pending.
- Call `estimateGas` before every write and show the cost in BOT. Never request token approvals or permissions of any kind.
- Decode custom errors with the template's ABI and map them to friendly copy (the `errors` map in each template definition). Never show a raw revert string or JSON-RPC error to users.
- Chain IDs are **677** (mainnet) and **968** (testnet). All network constants live in `src/config/networks.ts`. Registry addresses live in `src/config/addresses.ts`. Hard-code these values nowhere else.
- Persist unregistered deploys in localStorage under `botlaunchpad:v1:pending:<chainId>` (see `lib/storage.ts`).

## Contract rules

- Templates: no imports, no inheritance, no upgradeability, **no `immutable`** (every copy of a template must share one runtime code hash). `owner = msg.sender` goes in storage. Use custom errors, an event for every state change, byte-length caps on every string, and NatSpec on every public item.
- Changing a template's source changes its code hash, so you must deploy a **new registry**. Note it in `docs/CONTRACTS.md` → Changelog.
- Every template and the registry need tests with at least 2 signers, covering each revert path.

## Design rules (summary; full spec in docs/DESIGN_SYSTEM.md)

- Warm paper background, umber ink, hairline + dashed borders, square corners, tiny uppercase mono labels, two-tone headlines (second line grey).
- **Lilac means "your contract".** Use the accent only for things the user owns or just launched. Mint = live/ok, ember = old way/warning. No other accent colours.
- Use only the tokens from `@theme`. No arbitrary hex values in components, no `rounded-xl/2xl`, no gradients, no glassmorphism, no drop-shadow cards, no emoji, no stock 3D blobs.
- Reach for an existing primitive in `src/components/ui` before writing a new styled element. If one is missing, add it there with a typed variant API.
- Never copy Zaro's logo, illustrations, images or copy. We reuse the *system*, not the assets.

## Code conventions

- TypeScript strict, no `any`. Infer types from zod schemas and the ABI where possible.
- File names: `PascalCase.tsx` for components, `camelCase.ts` for hooks/utils (`useTxFlow.ts`), `kebab-case` for folders.
- One component per file. Co-locate a component's sub-parts in its folder.
- Use `cn()` from `lib/cn.ts` for class merging. Component variants use `cva` (class-variance-authority).
- Copy is plain English with no Solidity jargon in user-facing forms (say "Ends on", not "endsAt").
- Keep comments rare. Explain *why*, not *what*.

## Git

- Use [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary`. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. Scope is optional and is the module or area (`launch`, `contract`, `home`, `ui`, `web3`, `contracts`).
  - e.g. `feat(launch): add review step with gas estimate`, `fix(web3): handle 4902 on switch chain`, `docs: update build plan`
- Summary is imperative, lowercase, no trailing period, ≤ 72 chars.
- **No `Co-Authored-By` trailers or any Claude/AI attribution** in commit messages or PR descriptions.
- One logical change per commit. Commit only when asked.

## Definition of done (per task)

- `pnpm lint && pnpm typecheck` pass. Contract tests pass if contracts changed.
- Works on testnet with a real MetaMask, on mobile (375px) and desktop (1440px).
- Loading, empty, error and disabled states from PRD §10 are handled.
- The matching box in `docs/BUILD_PLAN.md` is ticked.
