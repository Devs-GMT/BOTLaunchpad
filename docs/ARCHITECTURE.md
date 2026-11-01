# Architecture

## 1. Repository layout

```
BOTLaunchpad/
├─ app/                         # ROUTING ONLY: thin files that render a module page
│  ├─ layout.tsx                # fonts, <Providers>, <PageShell>; imports src/styles/globals.css
│  ├─ page.tsx                  # → modules/home       HomePage
│  ├─ launch/
│  │  ├─ page.tsx               # → modules/launch     TemplatePickerPage
│  │  └─ [template]/page.tsx    # → modules/launch     LaunchWizardPage (+ generateStaticParams: 5 slugs)
│  ├─ c/[address]/
│  │  ├─ page.tsx               # → modules/contract   ContractPage (success + interact)
│  │  └─ verify/page.tsx        # → modules/verify     VerifyPage
│  ├─ my/page.tsx               # → modules/my-launches MyLaunchesPage
│  ├─ not-found.tsx             # → components/layout  NotFound
│  └─ icon.svg, opengraph-image.png
│
├─ src/
│  ├─ modules/                  # FEATURES: one folder per product area
│  │  ├─ home/
│  │  │  ├─ HomePage.tsx
│  │  │  ├─ sections/           # Hero, BuiltWith, Problem, SideBySide, LaunchStats,
│  │  │  │                      # Ownership, TemplateShowcase, ClosingCta
│  │  │  └─ index.ts
│  │  ├─ launch/
│  │  │  ├─ TemplatePickerPage.tsx
│  │  │  ├─ LaunchWizardPage.tsx
│  │  │  ├─ components/         # WizardSteps, TemplateCard, TemplateForm, ReviewTabs,
│  │  │  │                      # CodeView, NetworkPicker, GasEstimate, LaunchProgress
│  │  │  ├─ hooks/              # useDeploy, useRegister, useWizard
│  │  │  └─ index.ts
│  │  ├─ contract/
│  │  │  ├─ ContractPage.tsx    # resolves address → template, renders header + Interact
│  │  │  ├─ components/         # ContractHeader, SuccessPanel, NotLaunchpad, RegisterNow
│  │  │  ├─ hooks/              # useResolveContract
│  │  │  └─ index.ts
│  │  ├─ verify/
│  │  │  ├─ VerifyPage.tsx
│  │  │  ├─ components/         # SettingsTable, CopyBlock, VerifySteps
│  │  │  └─ index.ts
│  │  └─ my-launches/
│  │     ├─ MyLaunchesPage.tsx
│  │     ├─ components/         # LaunchRow, PendingRow
│  │     └─ index.ts
│  │
│  ├─ templates/                # DOMAIN: the 5 templates as data + adapters
│  │  ├─ types.ts               # TemplateDefinition, FieldConfig, TemplateSlug
│  │  ├─ defineTemplate.ts
│  │  ├─ registry.ts            # templatesBySlug, templatesById, allTemplates
│  │  ├─ guestbook/
│  │  │  ├─ definition.ts       # meta, zod schema, fields, toArgs, errors map
│  │  │  └─ GuestbookInteract.tsx
│  │  ├─ poll/      (definition.ts, PollInteract.tsx)
│  │  ├─ todo/      (definition.ts, TodoInteract.tsx)
│  │  ├─ tip-jar/   (definition.ts, TipJarInteract.tsx)
│  │  └─ check-in/  (definition.ts, CheckInInteract.tsx)
│  │
│  ├─ components/
│  │  ├─ code/                  # CodeView (shiki, lazy): shared by launch + verify
│  │  ├─ ui/                    # design-system primitives (no web3, no templates)
│  │  │  Button, LinkButton, Kicker, TwoToneHeading, Section, Container,
│  │  │  FolderCard, NotchCard, DashedBox, Chip, StatusDot, Pill, Field,
│  │  │  TextInput, TextArea, DateTimeInput, Toggle, SegmentedControl, Tabs,
│  │  │  Stepper, Skeleton, CopyButton, Tooltip, Dialog, Toast, LedgerRow
│  │  ├─ graphics/              # pure SVG/canvas art
│  │  │  DotMatrixStack, PixelIcon, DotWorldMap, GridBackdrop, LogoMark, Watermark
│  │  ├─ web3/                  # wallet-aware composites
│  │  │  ConnectButton, NetworkBadge, AddressPill, TxLink, ExplorerLink,
│  │  │  WrongNetworkBanner, InstallMetaMask, GasLine
│  │  └─ layout/                # Navbar, Footer, FooterStatusRow, PageShell, NotFound
│  │
│  ├─ web3/                     # chain access (framework-agnostic where possible)
│  │  ├─ providers.ts           # cached JsonRpcProvider per network (reads)
│  │  ├─ wallet/                # WalletProvider (context), useWallet, eip6963.ts, switchChain.ts
│  │  ├─ registry.ts            # typed LaunchpadRegistry client (reads + register)
│  │  ├─ deploy.ts              # ContractFactory deploy wrapper
│  │  ├─ useTxFlow.ts           # tx state machine hook
│  │  ├─ errors.ts              # decode custom errors / wallet errors → friendly copy
│  │  ├─ codeHash.ts            # getCode → keccak → templateId match
│  │  └─ queries.ts             # TanStack Query keys + hooks (useBlockNumber, useStats, …)
│  │
│  ├─ config/
│  │  ├─ networks.ts            # mainnet 677 / testnet 968: rpc, explorer, faucet, currency
│  │  ├─ addresses.ts           # registry address per chainId
│  │  └─ site.ts                # nav links, footer links, social URLs, copy constants
│  │
│  ├─ lib/                      # pure helpers
│  │  cn.ts, format.ts (address, BOT amount, relative time), storage.ts,
│  │  explorer.ts (tx/address URLs), share.ts, time.ts
│  │
│  ├─ providers/Providers.tsx   # QueryClientProvider + WalletProvider
│  ├─ generated/                # machine-written, do not edit
│  │  ├─ templates.json         #   by contracts/scripts/export.ts (templates: abi, bytecode, source)
│  │  ├─ registry.json          #   by contracts/scripts/export.ts (registry abi only)
│  │  └─ deployments.json       #   by contracts/scripts/deploy-registry.ts
│  └─ styles/globals.css        # @import "tailwindcss"; @theme tokens; base layer
│
├─ contracts/                   # Hardhat package (own package.json)
│  ├─ contracts/
│  │  ├─ templates/ Guestbook.sol, Poll.sol, TodoBoard.sol, TipJar.sol, EventCheckIn.sol
│  │  ├─ LaunchpadRegistry.sol
│  │  └─ interfaces/IOwned.sol
│  ├─ test/                     # one file per contract + registry.fake.test.ts
│  ├─ scripts/ templates.ts, export.ts, deploy-registry.ts
│  └─ hardhat.config.ts
│
├─ public/                      # images (template covers, problem-card photos), og
├─ docs/                        # this folder
├─ CLAUDE.md, PRD.md, README.md
└─ package.json, pnpm-workspace.yaml, tsconfig.json, next.config.ts, eslint.config.mjs
```

## 2. Layers and allowed imports

```
app ──► modules ──► templates ──► web3 ──► config, lib
              │         │
              └────────►┴──► components/{web3,layout,graphics} ──► components/ui ──► lib
```

| Layer | May import | Must not import |
|---|---|---|
| `app/` | `modules/*` (index only), `providers`, `styles` | everything else |
| `modules/X` | own files, `templates`, `components`, `web3`, `config`, `lib` | `modules/Y` internals |
| `templates/` | `components`, `web3`, `config`, `lib`, `generated` | `modules` |
| `components/ui` | `lib/cn` | `web3`, `templates`, `config` |
| `web3/` | `config`, `lib`, `generated` | React components outside `wallet/` |

ESLint enforces the boundaries through `no-restricted-imports` patterns (see BUILD_PLAN P0).

## 3. The template contract (frontend side)

```ts
// src/templates/types.ts (abridged)
export interface TemplateDefinition<S extends z.ZodType> {
  id: 1 | 2 | 3 | 4 | 5;                 // = TEMPLATE_ID in Solidity
  slug: TemplateSlug;
  title: string;
  icon: "book" | "bars" | "list" | "coin" | "pin";   // PixelIcon
  category: 'COMMUNITY' | 'TEAMS' | 'CREATORS' | 'EVENTS';
  useCase: string;                       // one line for the card
  description: string;                   // paragraph on the form step
  schema: S;                             // zod: byte caps, dates, option rules
  fields: readonly FieldConfig[];        // render order + labels + hints
  defaults: () => z.input<S>;
  toArgs: (v: z.output<S>) => unknown[]; // → constructor args, in order
  argNames: readonly string[];           // shown in the Review "constructor call"
  summary: (v: z.output<S>) => SummaryRow[];
  feedName: (v: z.output<S>) => string;  // default registry name (clamped to 64 bytes)
  errors: Record<string, string>;        // CustomError name → friendly copy
}
// defineTemplate() joins the definition with its artifact from generated/templates.json by id.
```

`FieldConfig` supports `text | textarea | datetime | number | list (min/max items) | segmented`. `TemplateForm` renders any definition generically, so no per-template form components exist.

Definitions stay free of React so server components can import them. Interact UIs share `templates/runtime.ts` (`useTemplateRead`, `useTemplateWrite`, `useNow`, `lastPage`) and `components/web3/ActionButton` (wallet gate + button + `TxStatus`). The Interact UIs live next to each definition (`templates/<slug>/<Name>Interact.tsx`) and are mapped in `templates/interact.ts` with `next/dynamic`, so only the contract page loads them.

## 4. Data flow

### Launch
```
TemplatePicker ─► /launch/[slug]
  useWizard (step: form → review → launch → register → done), persisted in sessionStorage
  form:    react-hook-form + zodResolver(definition.schema)
  review:  args = definition.toArgs(values)
           gas  = factory.getDeployTransaction(...args) → provider.estimateGas
           code = artifact.source (shiki) + highlighted constructor call
  launch:  useDeploy → useTxFlow(factory.deploy(...args)) → address
           → lib/storage.savePending({address, templateId, name, txHash, chainId})
  register:useRegister → useTxFlow(registry.register(address, id, name))
           → storage.removePending, invalidate ['launches', chainId]
  done:    router.push(`/c/${address}?net=${network}&new=1`)
```

### Contract page `/c/[address]?net=mainnet|testnet`
```
useResolveContract(address, chainId):
  1. registry.idOf(address) > 0     → Launch (registered)
  2. else getCode → keccak256 → match artifact.runtimeCodeHash → templateId (unregistered)
  3. else, if no code on this net, check the other net → offer "Open on Testnet/Mainnet"
  4. else → <NotLaunchpad/> + explorer link
→ ContractHeader (+ SuccessPanel when ?new=1) + definition.Interact
```

### Reads
Everything goes through TanStack Query with keys `[entity, chainId, ...args]`:
- `useBlockNumber(chainId)`: poll every 3 s (block time is ~0.75 s, and 3 s is enough for UI). Used by the hero timeline and the footer.
- `useRegistryStats(chainId)`: staleTime 30 s.
- `useLaunches(chainId, from, count)`, `useLaunchesOf(chainId, owner)`
- Template-specific reads live next to each `*Interact.tsx` as small hooks and refetch after their own writes.

## 5. Network & wallet

- `useSelectedNetwork()` (`web3/network.ts`) is the network picked for launching: a `useSyncExternalStore` over localStorage, default `mainnet`. The Testnet toggle writes it. No root provider reads `?net=`, because reading search params at the root would suspend every page under Cache Components. Pages addressed by URL (`/c/[address]?net=`) read the param themselves (inside `<Suspense>`) via `networkFromParam()` and pass the network down explicitly.
- `WalletProvider` discovers MetaMask through EIP-6963 (falls back to `window.ethereum`) and exposes `{status, address, chainId, connect, switchTo(network)}`. It listens to `accountsChanged` and `chainChanged`.
- `switchTo` calls `wallet_switchEthereumChain` and falls back to `wallet_addEthereumChain` with the params from `config/networks.ts` on error 4902.
- Write buttons wrap in `<RequireWallet network>`, which renders one of: Install MetaMask → Connect → Switch network → the child.

## 6. Transaction state machine (`useTxFlow`)

```
idle ─send()─► signing ─(user rejects 4001)─► rejected ─retry─► signing
                  │
                  └─(hash)─► pending ─(receipt.status=1)─► confirmed
                                  └─(revert / timeout)───► failed(reason)
```
It returns `{state, hash, receipt, error, send, reset}`. `LaunchProgress` and every Interact button render from this one shape.

## 7. Persistence

| Key | Storage | Content |
|---|---|---|
| `botlaunchpad:v1:net` | local | selected network |
| `botlaunchpad:v1:pending:<chainId>` | local | unregistered deploys `[{address, templateId, name, txHash, at}]` |
| `botlaunchpad:v1:wizard:<slug>` | session | form values + step (survives refresh mid-launch) |

## 8. Rendering & hosting

- Marketing sections are server components. Anything that touches the wallet or RPC is a client component, and its page is marked `'use client'` at the module page level.
- `/c/[address]` is dynamic and rendered client-side, so no server work happens. Vercel serves it with no functions.
- No API routes, no server actions, no environment secrets. The only env var is the public `NEXT_PUBLIC_SITE_URL` (for share links and OG).
- **Hosting decision (2026-11-01): Vercel.** Do not add `output: 'export'`.
