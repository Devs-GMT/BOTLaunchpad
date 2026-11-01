# Build Plan: BOT Launchpad

Phases run in order. A later phase may start early only where noted (∥ = can run in parallel).
Every phase ends with an **acceptance check**. Tick boxes as you go. Estimates assume one developer working with Claude Code.

| Phase | Goal | Est. |
|---|---|---|
| P0 | Repo, tooling, tokens, fonts, boundaries | 0.75 h |
| P1 | 5 template contracts + tests | 1.5 h |
| P2 | Registry + export pipeline + testnet deploy | 0.75 h |
| P3 ∥ P1 | UI primitives + graphics | 1.5 h |
| P4 | Web3 layer (networks, wallet, providers, tx flow) | 1 h |
| P5 | Launch wizard (pick → form → review → deploy → register) | 1.5 h |
| P6 | Contract page + 5 Interact UIs | 1.5 h |
| P7 | Verify helper + My launches | 0.5 h |
| P8 | Home page (8 sections) | 1.5 h |
| P9 | Navbar, footer + status row, states, responsive, a11y | 1 h |
| P10 | Mainnet, seed, deploy, README, demo | 0.75 h |
| | **Total** | **~12 h** |

---

## P0 · Foundation

- [x] `pnpm create next-app` (TS, App Router, ESLint, **no** `src/` option; we create `src/` manually as a sibling of `app/`), Tailwind v4
- [x] `pnpm-workspace.yaml` with `.` and `contracts`
- [x] `tsconfig.json` paths: `"@/*": ["./src/*"]`, `strict: true`, `noUncheckedIndexedAccess: true`
- [x] Deps: `ethers`, `@tanstack/react-query`, `zod`, `react-hook-form`, `@hookform/resolvers`, `class-variance-authority`, `clsx`, `tailwind-merge`, `shiki`
- [x] Create folders from [ARCHITECTURE.md §1](ARCHITECTURE.md) with `index.ts` barrels (created per phase as they get content; git does not track empty folders)
- [x] `src/styles/globals.css` with the full `@theme` from [DESIGN_SYSTEM.md §3](DESIGN_SYSTEM.md), base layer, `@utility` helpers
- [x] `app/layout.tsx`: `Host_Grotesk` + `JetBrains_Mono` from `next/font/google` as CSS variables, `<Providers>`, `<PageShell>`
- [x] ESLint `no-restricted-imports`: block `@/modules/*/*` (only barrels), block `@/web3*` and `@/templates*` inside `src/components/ui/**`, block any non-`@/modules` import inside `app/**` except providers/styles/layout
- [x] Scripts: `dev`, `build`, `start`, `lint`, `typecheck` (`next typegen && tsc --noEmit`)
- [x] `.env.example` with `NEXT_PUBLIC_SITE_URL`
- [x] `git init`, `.gitignore` (node_modules, .next, contracts/artifacts, contracts/cache, .env*)

**Accept:** `pnpm dev` shows a blank page in Host Grotesk on `paper-100`. `pnpm lint && pnpm typecheck` pass. A deliberate cross-module import fails lint.

## P1 · Template contracts

- [x] `contracts/` Hardhat 3 TS package: networks `botTestnet` (968, rpc.bohr.life) and `botMainnet` (677, rpc.botchain.ai), compiler settings from [CONTRACTS.md §2](CONTRACTS.md), key via `configVariable("DEPLOYER_KEY")` (env var or `hardhat keystore set DEPLOYER_KEY`)
- [x] `Guestbook.sol` + tests
- [x] `Poll.sol` + tests (option bounds, end time, close, double vote)
- [x] `TodoBoard.sol` + tests (openToAll on/off, toggle permissions)
- [x] `TipJar.sol` + tests (min tip, withdraw by owner only, empty withdraw, balance zero after withdraw, plain transfer reverts)
- [x] `EventCheckIn.sol` + tests (before/inside/after window via `time.increaseTo`, cap, double check-in)
- [x] Every test uses ≥ 2 signers (`vm.prank`) and hits every custom error. Tests are Solidity (forge-std), the Hardhat 3 default for unit tests.
- [x] Test that two deployments with different args share one `keccak256(getCode)`
- [x] ~~Gas report~~ → `deployGas` is measured by `scripts/export.ts` instead (moved to P2)

**Accept:** `pnpm -C contracts test` is green. Code hashes are identical across instances of a template.

## P2 · Registry + export pipeline

- [x] `LaunchpadRegistry.sol` + `IOwned.sol` per [CONTRACTS.md §5](CONTRACTS.md)
- [x] Registry tests incl. `FakeOwned` (test-only) rejected with `CodeMismatch` (11 tests)
- [x] `scripts/export.ts`: deploy each template on the in-process network, measure `deployGas`, assert codehash, write `src/generated/templates.json` (schema §7)
- [x] `scripts/deploy-registry.ts`: checks templates.json is fresh, deploys with its hashes, writes `src/generated/deployments.json` (read by `src/config/addresses.ts`)
- [x] Deploy the registry on **testnet**: `0xE310126CF53AeE93185Aae969a619cb402bEB472` (CONTRACTS.md §8)
- [x] Check on testnet with 2 wallets: `scripts/smoke.ts` deploys all 5 templates, registers them, proves 4 rejection paths, votes + signs from wallet #2, reads `stats()`

**Accept:** `templates.json` exists and is valid. The testnet registry address resolves on scan.bohr.life. Registering a real contract succeeds and a fake one fails.

## P3 · UI primitives & graphics (∥ with P1/P2)

- [x] `lib/cn.ts`, `lib/format.ts` (shortAddress, formatBOT, relativeTime, byteLength)
- [x] `components/ui`: Button, LinkButton, Kicker, TwoToneHeading, Section, Container, DashedBox, Chip, StatusDot, Pill, LedgerRow, Skeleton, CopyButton
- [x] `components/ui`: FolderCard (SVG clipPath, stacked variant), NotchCard
- [x] `components/ui` form set: Field, TextInput, TextArea, DateTimeInput, NumberInput, ListInput, SegmentedControl, Toggle
- [x] `components/ui`: Tabs, Stepper, Dialog (Toast + Tooltip deferred to the first screen that needs them, P5)
- [x] `components/graphics`: LogoMark (3×3 dot glyph), PixelIcon (key, shield, lock, map, check, wallet, code), DotMatrixStack (ambient twinkle/breathe + block-tick flash), DotWorldMap (rasterised from coarse outlines), Watermark. GridBackdrop = `pixel-grid` utility on `Section grid`.
- [x] A temporary `/kitchen` route (404 in production, removed in P9) that renders every primitive and variant. (`_kitchen` is a private folder in the App Router, so it can't be a route.)

**Accept:** the kitchen page looks right at 375px and 1440px. No arbitrary hex values (`grep -r "\[#" src` is empty). No `rounded-xl/2xl`.

## P4 · Web3 layer

- [x] `config/networks.ts` (both networks, `addEthereumChain` params), `config/addresses.ts`, `config/site.ts`
- [x] `web3/providers.ts`: memoised `JsonRpcProvider` per chainId (`staticNetwork: true`)
- [x] ~~`providers/NetworkProvider`~~ → `web3/network.ts` `useSelectedNetwork()` (localStorage) + `networkFromParam()` for URL-addressed pages (see ARCHITECTURE §5)
- [x] `web3/wallet/`: EIP-6963 discovery, `WalletProvider`, `useWallet`, `switchTo` with the add-chain fallback (4902)
- [x] `components/web3/RequireWallet`: Install → Connect → Switch → children
- [x] `web3/useTxFlow.ts` state machine ([ARCHITECTURE.md §6](ARCHITECTURE.md))
- [x] `web3/errors.ts`: decode wallet errors (4001 rejected, insufficient funds) + custom errors via `Interface.parseError`
- [x] `web3/registry.ts`: typed reads + `register()`
- [x] `web3/codeHash.ts`: address → templateId by runtime hash
- [x] `web3/queries.ts`: `useBlockNumber`, `useRegistryStats`, `useLaunches`, `useLaunchesOf`
- [x] `components/web3`: ConnectButton (wallet chip, includes wrong-network state), RequireWallet (install → connect → switch), AddressPill, TxLink. GasLine moves to P5 with estimateGas.

**Accept:** connecting MetaMask shows the chip with network + short address. Switching to testnet adds the chain if it's missing. The block number ticks on a test page with no wallet connected.

## P5 · Launch wizard

- [x] `templates/types.ts`, `defineTemplate.ts`, `registry.ts` (joins definitions with `generated/templates.json` by id)
- [x] 5 `definition.ts` files: meta, zod schema (byte caps, poll options 2–6, future dates), fields, defaults, `toArgs`, `feedName`, `errors`
- [x] `/launch`: TemplatePickerPage with 5 FolderCards (functions count + est. gas from `deployGas × gasPrice`)
- [x] `/launch/[template]`: `generateStaticParams` for the 5 slugs. Unknown slug → `notFound()`
- [x] `useWizard` with sessionStorage persistence
- [x] Generic `TemplateForm` driven by `fields` + live validation + byte counters
- [x] Review: Summary tab, View code tab (shiki, lazy) + highlighted constructor-call block, Network tab (segmented switch, "Try Testnet first — it's free" + faucet link), live `estimateGas`
- [x] `useDeploy`: ContractFactory deploy via useTxFlow, then save pending to localStorage
- [x] `useRegister`: register via useTxFlow, then remove pending and invalidate queries. Show the note "2 quick transactions: one creates your contract, one lists it." and a "Skip for now" option.
- [x] LaunchProgress stepper: Waiting for confirmation → Deploying… (tx link) → Live at 0x… ✓ → Listing… → Listed ✓
- [x] On finish, go to `/c/<addr>?net=<net>&new=1`

_Verified 2026-11-01 with a headless E2E (Playwright + an injected EIP-1193 wallet backed by the burner key): all 5 templates launched and listed through the UI on testnet; validation, refresh persistence and wallet rejection → retry checked._

**Accept:** on testnet, each of the 5 templates deploys from the browser, registers, and shows up in `stats()`. Rejecting either MetaMask prompt shows a retry. Refreshing mid-wizard keeps the values.

## P6 · Contract page + Interact UIs

- [x] `useResolveContract` (registry, then codehash, then other-network check, then not-launchpad)
- [x] ContractHeader ledger (name, template chip, owner, "You own this" lilac pill, explorer, share, verify link)
- [x] SuccessPanel (`?new=1`): copy address, View on explorer ↗, Share, Verify helper, Launch another. If not listed: `RegisterNow`
- [x] NotLaunchpad state + explorer link
- [x] `GuestbookInteract`: sign form + wall (newest first, paginated). Disabled if already signed.
- [x] `PollInteract`: options as vote buttons + result bars, ends-in countdown, owner Close. Disabled with a reason when ended, closed or already voted.
- [x] `TodoInteract`: add task (hidden or explained if not allowed), list with toggle per permission
- [x] `TipJarInteract`: amount (min 0.001) + note, tips list, total, owner Withdraw (disabled at 0)
- [x] `CheckInInteract`: check-in button with window/cap state, count/max meter, attendee ledger
- [x] All Interact writes use useTxFlow + estimateGas + friendly errors, and refetch after confirmation

_Verified 2026-11-01 (headless E2E, two real wallets on testnet): visitor voted, signed, was blocked from an owner-only board, tipped (and got the min-tip error first), checked in; owner added + ticked a task, withdrew, sees Close poll; unlisted contract listed from its own page; registry address → not-Launchpad, EOA → nothing deployed, testnet contract opened as mainnet → wrong-network with a switch link._

**Accept:** opening a launched contract from a second wallet (incognito/other account) can use every Interact action. A random EOA or ERC-20 address shows NotLaunchpad.

## P7 · Verify helper + My launches

- [x] `/c/[address]/verify`: settings ledger, ABI-encoded constructor args (read back via each template's `readArgs`), downloadable Standard JSON input, source, steps for Blockscout
- [x] Verify one testnet contract using only the helper's output: Poll `0x85f9…5dEC` verified on scan.bohr.life via the Blockscout API (standard-input). Result is a **partial** match, because templates are compiled with `bytecodeHash: none`; copy updated to say so.
- [x] `/my`: "Listed" (from `launchesOf`) and "Not listed yet" (localStorage) with `Register now`. Empty states. Connect prompt when disconnected.

**Accept:** a testnet contract verifies on scan.bohr.life using only copied values from the helper.

## P8 · Home page

- [ ] S1 Hero: 3-line headline, body, two CTAs. DotMatrixStack + live block timeline.
- [ ] S2 Built-with strip (dashed slots)
- [ ] S3 Problem: 3 FolderCards with photos + captions
- [ ] S4 Side-by-side: Old way (paper-300, ember dot, 8 steps) vs Launchpad (lilac-200, mint dot, 3 steps + live registry rows from `getLaunches`)
- [ ] S5 Launch stats: thin bar chart per template from `stats()` + total counter (Skeleton while loading)
- [ ] S6 Ownership: coal NotchCard, pixel key/shield, cycling 01 OWN · 02 VERIFY · 03 OPEN
- [ ] S7 Template showcase: horizontal scroll-snap FolderCards → `/launch/[slug]`
- [ ] S8 Closing CTA: coal band, DotWorldMap, Testnet (teal) / Mainnet (outline-light) buttons, FAQ row (6 items, `<details>` accordion)
- [ ] Section entrance animation + reduced-motion handling

**Accept:** all 8 sections match PRD §9 copy. Live numbers come from the RPC/registry, with no hard-coded counts. Lighthouse on mobile scores ≥ 90 for performance and ≥ 95 for accessibility.

## P9 · Shell, states, polish

- [x] Navbar: transparent at the top → paper-50 + hairline after scroll. Mobile sheet. Wallet chip + `Launch a contract →`. (Built early in P5.)
- [ ] Footer per PRD §12: status row (live dot, BOT Chain logo → botchain.ai, chain id, live block, launched count, registry address copy, View on explorer →), 4 link columns, "Built on BOT Chain" hex badge, giant watermark, bottom mono row. Grey dot + "RPC not responding" on failure.
- [ ] Walk through every state in PRD §10 and tick it here:
  - [ ] No MetaMask · [ ] Wrong network · [ ] Not enough BOT (faucet / get BOT link)
  - [ ] Form errors · [ ] Deploy rejected/failed · [ ] Register skipped/failed → Register now
  - [ ] Registry rejections (not owner / unknown code / already registered)
  - [ ] Not a Launchpad contract · [ ] Ended/closed/full/already-done disabled reasons
  - [ ] Empty Tip Jar withdraw disabled · [ ] Slow RPC skeletons · [ ] Pending tx progress + link
- [ ] Safety copy: "Templates are provided as-is. Start on Testnet. Don't use Tip Jar for large amounts."
- [ ] Keyboard pass (focus rings visible, tab order), `aria-live` for tx progress, colour contrast AA
- [ ] Metadata + OG image per route; `/c/[address]` title = contract name when resolved
- [ ] Remove `/kitchen` (`app/kitchen`, `src/modules/kitchen`)

**Accept:** a full run on a 375px phone with MetaMask mobile's in-app browser works end to end.

## P10 · Ship

- [ ] Deploy the registry on **mainnet**. Update `addresses.ts`, CONTRACTS.md §8, README, and the footer constant.
- [ ] Seed: launch 1 of each template on mainnet from the site itself and register them. Record the addresses.
- [ ] Vercel project + custom domain, `NEXT_PUBLIC_SITE_URL` set
- [ ] README (see [README.md](../README.md)): what it is, how the templates were compiled, safety note, addresses, local dev
- [ ] Demo clip: pick Poll → fill → launch → register → vote from a 2nd wallet
- [ ] X post tagging @BOTChain_ai
- [ ] PRD §14 submission checklist complete

**Accept:** the PRD §1 must-haves are all ticked.
