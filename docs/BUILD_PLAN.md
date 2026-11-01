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

- [ ] `contracts/` Hardhat TS package: networks `botTestnet` (968, rpc.bohr.life) and `botMainnet` (677, rpc.botchain.ai), compiler settings from [CONTRACTS.md §2](CONTRACTS.md), key loaded from a `contracts/.env` `DEPLOYER_KEY` (gitignored)
- [ ] `Guestbook.sol` + tests
- [ ] `Poll.sol` + tests (option bounds, end time, close, double vote)
- [ ] `TodoBoard.sol` + tests (openToAll on/off, toggle permissions)
- [ ] `TipJar.sol` + tests (min tip, withdraw by owner only, empty withdraw, balance zero after withdraw, plain transfer reverts)
- [ ] `EventCheckIn.sol` + tests (before/inside/after window via `time.increaseTo`, cap, double check-in)
- [ ] Every test uses ≥ 2 signers and hits every custom error
- [ ] Test that two deployments with different args share one `keccak256(getCode)`
- [ ] Gas report enabled, which records `deployGas` per template

**Accept:** `pnpm -C contracts test` is green. Code hashes are identical across instances of a template.

## P2 · Registry + export pipeline

- [ ] `LaunchpadRegistry.sol` + `IOwned.sol` per [CONTRACTS.md §5](CONTRACTS.md)
- [ ] Registry tests incl. `FakeOwned.sol` (test-only) rejected with `CodeMismatch`
- [ ] `scripts/export.ts`: compile, deploy each template on the in-process network, assert codehash, write `src/generated/templates.json` (schema §7)
- [ ] `scripts/deploy-registry.ts`: reads the hashes from templates.json, deploys, prints the address, appends it to `CONTRACTS.md §8`
- [ ] Deploy the registry on **testnet**. Put the address in `src/config/addresses.ts`.
- [ ] Manual check on testnet with 2 wallets: deploy 1 Poll via Hardhat script → register → read `stats()`

**Accept:** `templates.json` exists and is valid. The testnet registry address resolves on scan.bohr.life. Registering a real contract succeeds and a fake one fails.

## P3 · UI primitives & graphics (∥ with P1/P2)

- [ ] `lib/cn.ts`, `lib/format.ts` (shortAddress, formatBOT, relativeTime, byteLength)
- [ ] `components/ui`: Button, LinkButton, Kicker, TwoToneHeading, Section, Container, DashedBox, Chip, StatusDot, Pill, LedgerRow, Skeleton, CopyButton
- [ ] `components/ui`: FolderCard (SVG clipPath, stacked variant), NotchCard
- [ ] `components/ui` form set: Field, TextInput, TextArea, DateTimeInput, NumberInput, ListInput, SegmentedControl, Toggle
- [ ] `components/ui`: Tabs, Stepper, Dialog, Toast, Tooltip
- [ ] `components/graphics`: LogoMark (3×3 dot glyph), PixelIcon (key, shield, lock, map, check, wallet), GridBackdrop, DotMatrixStack (static, then ambient animation), DotWorldMap, Watermark
- [ ] A temporary `/_kitchen` route (dev only, removed before P10) that renders every primitive and variant

**Accept:** the kitchen page looks right at 375px and 1440px. No arbitrary hex values (`grep -r "\[#" src` is empty). No `rounded-xl/2xl`.

## P4 · Web3 layer

- [ ] `config/networks.ts` (both networks, `addEthereumChain` params), `config/addresses.ts`, `config/site.ts`
- [ ] `web3/providers.ts`: memoised `JsonRpcProvider` per chainId (`staticNetwork: true`)
- [ ] `providers/NetworkProvider`: selected network from `?net=`, then localStorage, then mainnet
- [ ] `web3/wallet/`: EIP-6963 discovery, `WalletProvider`, `useWallet`, `switchTo` with the add-chain fallback (4902)
- [ ] `components/web3/RequireWallet`: Install → Connect → Switch → children
- [ ] `web3/useTxFlow.ts` state machine ([ARCHITECTURE.md §6](ARCHITECTURE.md))
- [ ] `web3/errors.ts`: decode wallet errors (4001 rejected, insufficient funds) + custom errors via `Interface.parseError`
- [ ] `web3/registry.ts`: typed reads + `register()`
- [ ] `web3/codeHash.ts`: address → templateId by runtime hash
- [ ] `web3/queries.ts`: `useBlockNumber`, `useRegistryStats`, `useLaunches`, `useLaunchesOf`
- [ ] `components/web3`: ConnectButton (wallet chip), NetworkBadge, AddressPill, TxLink, ExplorerLink, GasLine, WrongNetworkBanner

**Accept:** connecting MetaMask shows the chip with network + short address. Switching to testnet adds the chain if it's missing. The block number ticks on a test page with no wallet connected.

## P5 · Launch wizard

- [ ] `templates/types.ts`, `defineTemplate.ts`, `registry.ts` (joins definitions with `generated/templates.json` by id)
- [ ] 5 `definition.ts` files: meta, zod schema (byte caps, poll options 2–6, future dates), fields, defaults, `toArgs`, `feedName`, `errors`
- [ ] `/launch`: TemplatePickerPage with 5 FolderCards (functions count + est. gas from `deployGas × gasPrice`)
- [ ] `/launch/[template]`: `generateStaticParams` for the 5 slugs. Unknown slug → `notFound()`
- [ ] `useWizard` with sessionStorage persistence
- [ ] Generic `TemplateForm` driven by `fields` + live validation + byte counters
- [ ] Review: Summary tab, View code tab (shiki, lazy) + highlighted constructor-call block, Network tab (segmented switch, "Try Testnet first — it's free" + faucet link), live `estimateGas`
- [ ] `useDeploy`: ContractFactory deploy via useTxFlow, then save pending to localStorage
- [ ] `useRegister`: register via useTxFlow, then remove pending and invalidate queries. Show the note "2 quick transactions: one creates your contract, one lists it." and a "Skip for now" option.
- [ ] LaunchProgress stepper: Waiting for confirmation → Deploying… (tx link) → Live at 0x… ✓ → Listing… → Listed ✓
- [ ] On finish, go to `/c/<addr>?net=<net>&new=1`

**Accept:** on testnet, each of the 5 templates deploys from the browser, registers, and shows up in `stats()`. Rejecting either MetaMask prompt shows a retry. Refreshing mid-wizard keeps the values.

## P6 · Contract page + Interact UIs

- [ ] `useResolveContract` (registry, then codehash, then other-network check, then not-launchpad)
- [ ] ContractHeader ledger (name, template chip, owner, "You own this" lilac pill, explorer, share, verify link)
- [ ] SuccessPanel (`?new=1`): copy address, View on explorer ↗, Share, Verify helper, Launch another. If not listed: `RegisterNow`
- [ ] NotLaunchpad state + explorer link
- [ ] `GuestbookInteract`: sign form + wall (newest first, paginated). Disabled if already signed.
- [ ] `PollInteract`: options as vote buttons + result bars, ends-in countdown, owner Close. Disabled with a reason when ended, closed or already voted.
- [ ] `TodoInteract`: add task (hidden or explained if not allowed), list with toggle per permission
- [ ] `TipJarInteract`: amount (min 0.001) + note, tips list, total, owner Withdraw (disabled at 0)
- [ ] `CheckInInteract`: check-in button with window/cap state, count/max meter, attendee ledger
- [ ] All Interact writes use useTxFlow + estimateGas + friendly errors, and refetch after confirmation

**Accept:** opening a launched contract from a second wallet (incognito/other account) can use every Interact action. A random EOA or ERC-20 address shows NotLaunchpad.

## P7 · Verify helper + My launches

- [ ] `/c/[address]/verify`: settings ledger, ABI-encoded constructor args (CopyBlock), source (CopyBlock), steps for scan.botchain.ai
- [ ] Verify one testnet contract manually using only the helper's output, and fix the steps text to match the real explorer form
- [ ] `/my`: "Listed" (from `launchesOf`) and "Not listed yet" (localStorage) with `Register now`. Empty states. Connect prompt when disconnected.

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

- [ ] Navbar: transparent at the top → paper-50 + hairline after scroll. Mobile sheet. Wallet chip + `Launch a contract →`.
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
- [ ] Remove `/_kitchen`

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
