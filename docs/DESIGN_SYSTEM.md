# Design System: "Paper & Ledger"

Reference: zaro.ai, studied from its live CSS (Nov 2026) and the screen recording in PRD §8.
Rule: **we reuse the system, not the assets.** No Zaro logo, illustrations, photos, copy or font files.

---

## 1. What makes Zaro look like Zaro (observed)

These come from Zaro's shipped CSS, not guesses:

| # | Trait | Evidence in their code |
|---|---|---|
| 1 | **Warm, not grey.** Every neutral is a warm brown-beige. The ink is umber `#201613`, never pure black. | `--color-umber-800:#201613`, `--color-cloud-*` scale `#fafaf8 → #292521` |
| 2 | **Square corners everywhere.** Buttons, nav, logo boxes. | `rounded-none` on buttons and the nav rail |
| 3 | **Borders do the work, not shadows.** 1px hairlines at low alpha ink, plus dashed boxes for "slots". | `--border:#2016131f`, `border-dashed border-cloud-200` logo cells, `h-[60px]` |
| 4 | **One grotesk, medium weight, tight tracking.** Display sizes jump big. | Saans → fallback Host Grotesk. `font-medium`, hero 40/56/84px, `-1px` tracking at 84px, h2 `-0.022em`, `leading-[1.1]` |
| 5 | **Tiny mono uppercase labels** as the "voice of the machine": kickers, dates, stats. | JetBrains Mono 12px uppercase, `tracking-[0.01em]` to `0.06em`, `tabular-nums`, colour `cloud-500` |
| 6 | **Two-tone headlines.** Line 1 ink, line 2 muted. | h2 patterns + `<br>` splits |
| 7 | **Folder silhouette cards.** A tab on the top-left, the rest of the top edge steps down through a diagonal. | `clipPath` `M0,0 L.69,0 L.81,.133 L1,.133 L1,1 L0,1 Z` |
| 8 | **Faint pixel grid** behind art and dark blocks. | `.pixel-grid { 24px grid, 1px lines @ #2016130f }` |
| 9 | **A single cool accent** (lilac) against the warm field. Semantic small colours: green = live, orange = stale. | `--color-lilac-300:#bdb4f8` as `--accent`, green-400, orange-500 |
| 10 | **Dot/pixel illustrations with slow ambient motion** (twinkle, drift, breathe), never bouncy. | `@keyframes pixel-twinkle, ambient-breathe, drift`, ease `cubic-bezier(.22,1,.36,1)` |
| 11 | **Wide rails.** Content max ~1240px (medium) / ~1653px (full), 16px pill padding on the nav. | `--site-rail-medium:1240px`, `--site-rail-max:1653px` |
| 12 | **Primary button = solid ink rectangle**, 36px (nav) / 48px (hero), 14–16px medium text, trailing arrow. Secondary = 1px border, transparent. | `bg-umber-800 text-cloud-50 h-9 px-3`, outline `border-umber-400 h-12 px-6` |

## 2. What we change (so it is ours)

| Zaro | BOT Launchpad |
|---|---|
| Lilac is a generic accent | **Lilac means "yours."** It appears only on the user's contract, wallet, or freshly launched item. This rule gives the colour meaning. |
| Abstract knowledge-graph art | **Dot-matrix = blocks and bytecode.** Hero planes are real blocks. The top plane's lilac cluster is "your contract". The timeline shows the live block number from RPC. |
| Folder cards hold marketing imagery | **Folder cards are contract files.** The tab holds a filename chip (`Poll.sol`, `TipJar.sol`), which ties the shape to code. |
| Mono dates are decorative | **Mono rows are a ledger of real data:** block numbers, tx hashes, `0x12ab…9f3c`, chain ID. Never fake timestamps once the data is available. |
| "Sign in" text link | **Wallet chip:** status dot + network name + short address. Lilac dot when connected (it's *your* wallet). |
| Teal used sparingly | **Teal = action on dark.** The only button colour on charcoal sections. |
| Brand mark | Our own **3×3 dot launch glyph**: eight umber dots, the top-right one lilac and offset up by half a step ("lifting off"). It is also used as the footer watermark. |

## 3. Tokens (Tailwind v4 `@theme`)

Put these in `src/styles/globals.css`. Components may use **only** these names.

```css
@import "tailwindcss";

@theme {
  /* paper: warm neutrals (light → dark) */
  --color-paper-0:   #FFFFFF;
  --color-paper-50:  #FBFBFA;  /* navbar, raised surfaces */
  --color-paper-100: #F7F7F5;  /* page background */
  --color-paper-200: #F3F3EE;  /* soft panel */
  --color-paper-300: #E6E5DE;  /* warm grey panel ("old way") */
  --color-paper-400: #E2E2DE;  /* dashed borders, dividers */
  --color-paper-500: #C2BFAF;
  --color-paper-600: #9F9D9B;  /* decoration / disabled only (fails AA for body) */
  --color-paper-700: #7C7A76;  /* second line on dark */

  /* ink: umber */
  --color-ink-900: #191310;    /* headlines, primary button */
  --color-ink-800: #2A211D;    /* primary hover */
  --color-ink-700: #44423E;    /* text on panels */
  --color-ink-600: #4A4441;    /* second headline line (light) */
  --color-ink-500: #736761;    /* mono labels */

  /* charcoal: dark sections + footer */
  --color-coal-900: #211F1B;
  --color-coal-800: #2F2C25;   /* grid lines on dark */
  --color-coal-700: #3C3A36;   /* watermark */

  /* lilac: "yours" (the only cool accent) */
  --color-lilac-100: #EEEDFD;
  --color-lilac-200: #D4D1F9;  /* highlight panel */
  --color-lilac-300: #CBC9E6;  /* lilac dots */
  --color-lilac-400: #B0A7F5;  /* pill / badge */
  --color-lilac-600: #6352D9;  /* focus ring, lilac text on paper (~5.2:1 on paper-100, AA) */

  /* teal: action on dark */
  --color-teal-300: #93CDD7;
  --color-teal-500: #78A1A6;
  --color-teal-900: #2E5152;

  /* status */
  --color-mint-500:  #67B470;  /* live / success */
  --color-ember-500: #FD5B13;  /* old way / warning */
  --color-danger-600:#C2410C;  /* errors (text) */

  /* type */
  --font-sans: var(--font-host-grotesk), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, monospace;

  --text-hero-sm: 2.5rem; --text-hero-sm--line-height: 1; --text-hero-sm--letter-spacing: -0.02em;  /* 40px, mobile hero */
  --text-hero: 5.25rem;   --text-hero--line-height: 1;    --text-hero--letter-spacing: -0.012em; /* 84px */
  --text-h1:   3.5rem;    --text-h1--line-height: 1.04;   --text-h1--letter-spacing: -0.02em;    /* 56px */
  --text-h2:   2.75rem;   --text-h2--line-height: 1.1;    --text-h2--letter-spacing: -0.022em;   /* 44px */
  --text-h3:   1.5rem;    --text-h3--line-height: 1.2;    --text-h3--letter-spacing: -0.015em;   /* 24px */
  --text-body-lg: 1.125rem; --text-body-lg--line-height: 1.5;                                   /* 18px */
  --text-body: 1rem;      --text-body--line-height: 1.55;
  --text-small: 0.875rem; --text-small--line-height: 1.45;
  --text-mono: 0.75rem;   --text-mono--line-height: 1rem;  --text-mono--letter-spacing: 0.04em;  /* 12px */
  --text-micro: 0.625rem; --text-micro--line-height: 0.875rem; --text-micro--letter-spacing: 0.08em;

  /* layout */
  --container-prose: 44ch;        /* body copy measure */
  --container-rail: 77.5rem;      /* 1240px */
  --container-rail-wide: 103rem;  /* ~1650px, hero & footer */
  --spacing-section: 8rem;        /* vertical rhythm desktop; 5rem mobile via utility */

  /* radius: almost none */
  --radius-xs: 2px;
  --radius-sm: 4px;               /* inner cards only (white step card in SideBySide) */

  /* motion */
  --ease-out-quint: cubic-bezier(.22, 1, .36, 1);
  --ease-std: cubic-bezier(.4, 0, .2, 1);
}
```

Base layer: `body { @apply bg-paper-100 text-ink-900 font-sans antialiased; }`, `h1,h2,h3 { text-wrap: balance; font-weight: 500 }`, `::selection { background: var(--color-lilac-200) }`, focus ring `outline-2 outline-offset-2 outline-lilac-600`.

Utilities to add (`@utility`):
- `pixel-grid`: 24px grid of 1px lines at `rgb(25 19 16 / 0.06)`. A `pixel-grid-dark` variant uses `rgb(255 255 255 / 0.05)`.
- `hairline`: `border border-ink-900/12`
- `dashed-slot`: `border border-dashed border-paper-400`
- `section-y`: `py-20 md:py-[var(--spacing-section)]`

## 4. Typography rules

- **Host Grotesk 500** for every headline, **400** for body. No other weights except 600 for mono kickers.
- Hero: 40px mobile / 56px tablet / 84px desktop, 3 lines max.
- Headlines are almost always **two-tone**: `<TwoToneHeading lines={["Remix shows you how.", "Launchpad does it for you."]} />`. Line 2 is `ink-500` on light (reads lighter than PRD's #4A4441, closer to the reference) and `paper-700` on dark.
- Body copy is `ink-500` (≈5.1:1 on paper-100), max width 36–44ch, 16–18px. `paper-600` (≈2.6:1) fails AA, so use it only for decoration, disabled states, or text ≥ 24px. On coal, body copy is `paper-500`.
- Mono kicker: `font-mono text-mono uppercase text-ink-500`, optionally led by a 6px square bullet `▪`.
- Numbers (block, count, gas) are always `font-mono tabular-nums`.

## 5. Shapes

| Shape | Use | Implementation |
|---|---|---|
| **FolderCard** | Problem cards, template showcase covers, success page | `folder-clip` utility: CSS `polygon()` with a fixed 36px tab height and a 45° step (vars `--folder-tab-w`, `--folder-tab-h`), so the shape holds at any aspect ratio. The hairline is a clipped edge layer behind a 1px-inset clipped fill. Tab content (filename chip) sits top-left. |
| **NotchCard** | Dark "Ownership & Safety" block, Review panel | Trapezoid tab protruding above the top-left edge (label inside), body square. Tab: `clip-path: polygon(0 100%, 0 0, calc(100% - 16px) 0, 100% 100%)`. |
| **DashedBox** | Built-with chips, empty states, "slot" for a missing value, step badge "Steps: 8" | `dashed-slot`, height 60px for logo cells |
| **LedgerRow** | Registry feed, chips with filename + mono date, verify settings | `flex justify-between` · left: icon + label · right: mono muted value · 1px bottom hairline |
| **Pill** | Big step counts ("Steps: 3"), status | `rounded-full` is allowed **only** here. Lilac-400 fill for "yours", dashed for neutral. |

## 6. Component inventory (`src/components/ui`)

Every component exports its props type. Variants use `cva`.

| Component | Variants / props | Notes |
|---|---|---|
| `Button` | `variant: primary \| secondary \| ghost \| teal \| outline-light`, `size: sm(36) \| md(40) \| lg(48)`, `trailingArrow` | Square. Primary = ink-900 bg / paper-50 text, hover ink-800. Secondary = 1px ink-500 border, hover `bg-ink-900/5`. Arrow nudges 2px right on hover. |
| `LinkButton` | same as Button, `href`, `external` | external adds `↗` and `target=_blank rel=noopener` |
| `Kicker` | `bullet?`, `tone: light \| dark` | mono uppercase |
| `TwoToneHeading` | `as: h1 \| h2`, `size: hero \| h1 \| h2`, `lines: [string, string, string?]`, `tone` | line 2+ muted |
| `Section` | `tone: paper \| soft \| coal`, `rail: default \| wide`, `grid?` | handles `section-y`, container, optional pixel-grid |
| `FolderCard` | `tab: ReactNode`, `stacked?`, `media?`, `children` | see §5 |
| `NotchCard` | `label`, `tone: coal \| paper` | |
| `DashedBox` | `as`, `size: chip \| slot` | |
| `Chip` | `icon?`, `label`, `meta?` (mono right) | filename-style |
| `StatusDot` | `status: live \| old \| idle \| error`, `pulse?` | 8px square-ish dot, mint/ember/paper-500/danger |
| `Pill` | `tone: lilac \| dashed \| ink` | |
| `Field` | `label`, `hint`, `error`, `counter?` (`23/140`) | wraps inputs, shows live byte counter for capped strings |
| `TextInput`, `TextArea`, `DateTimeInput`, `NumberInput` | standard + `invalid` | 44px height, 1px border paper-400, focus border ink-900 + lilac ring |
| `ListInput` | `min`, `max`, `addLabel` | Poll options (+ Add option) |
| `SegmentedControl` | `options` | Network switch, "Who can add tasks" |
| `Tabs` | | Review: Summary · View code · Network |
| `Stepper` | `steps`, `current`, `orientation` | Wizard + LaunchProgress. Mono step numbers `01 02 03`. |
| `Skeleton` | `w`, `h` | shimmer is a slow 1.6s sweep on paper-200 |
| `CopyButton` | `value`, `label?` | swaps to "Copied" for 1.5s |
| `Dialog`, `Toast`, `Tooltip` | | Radix-free minimal implementations, or Radix primitives, styled to tokens |
| `LedgerRow` | `left`, `right`, `href?` | |

Graphics (`src/components/graphics`): `DotMatrixStack` (isometric planes, props `highlight`, `animate`), `PixelIcon` (`name: key \| shield \| lock \| map \| check`, drawn from a 12×12 bitmap array), `DotWorldMap`, `GridBackdrop`, `LogoMark`, `Watermark`. Draw them all as SVG from data arrays so they're crisp, themeable and tiny. No PNG art.

## 7. Layout

- Rail: `max-w-rail mx-auto px-4 md:px-8 lg:px-16`. Hero and footer use `max-w-rail-wide`.
- Navbar: fixed, 12px (mobile) / 20px (desktop) from the top. A full-width bar inside the rail, `h-14`, transparent at the top of the page; after 8px of scroll it gets `bg-paper-50 hairline`. Logo left, text links centre-left, right side holds the wallet chip + primary `Launch a contract →` (sm). Below lg, links collapse into a square menu button that opens a full-width sheet.
- Grid: 12 columns, `gap-6`. Hero is 6/6 split, Ownership 5/7.
- Section rhythm: 128px desktop / 80px mobile. Sections on paper never get a background change except `soft` (paper-200) and `coal`.

## 8. Motion

- Default transition: 150–200ms `ease-std` on colour and border. No scale-on-hover for cards, only a border darken (`paper-400 → ink-500/50`).
- Section entrance: fade + `translateY(18px → 0)`, 600ms `ease-out-quint`, once, via IntersectionObserver. Stagger children by 60ms.
- Ambient (graphics only): `pixel-twinkle` (dots fade 0.4↔1, random delays, 3–6s), `breathe` (planes drift ±4px, 8s). Block-tick: when `useBlockNumber` changes, the top plane flashes one row of mint dots for 400ms.
- `prefers-reduced-motion`: ambient and entrance animations are off; state changes are instant.

## 9. Anti-slop rules

Reject a PR or change that contains any of these:

1. Purple/blue gradients, mesh gradients, "aurora" blobs, glow orbs.
2. Glassmorphism (`backdrop-blur` cards), except the scrolled navbar (which uses an opaque paper-50 anyway).
3. `rounded-xl`, `rounded-2xl`, or `rounded-3xl` anywhere. `rounded-full` only on `Pill`/`StatusDot`.
4. Drop-shadow cards (`shadow-lg`, etc.). Elevation = hairline border + background step.
5. Emoji as icons, or generic icon-library spam (a lucide icon beside every heading). Icons are our `PixelIcon` set or 14px line arrows `→ ↗`.
6. Centred-everything layouts. Default is left-aligned with asymmetric splits. Centre only Section 7's heading and the closing CTA.
7. Copy clichés: "Unlock", "Empower", "Seamless", "Revolutionize", "Web3 made easy", "🚀". Write short declaratives like PRD §9.
8. Fake data where real data exists (block number, launch counts, registry feed). Before data loads use `Skeleton`, never invented numbers.
9. More than one accent colour on a screen. Lilac = yours, mint/ember = status, teal = action on dark. Nothing else.
10. Stock 3D renders, AI-generated illustrations with glossy surfaces, or Zaro's own images. Photo cards use real, licensed photos (Unsplash) treated with a warm desaturated grade (`saturate(.6) sepia(.08)`).
11. Arbitrary values in classes (`text-[#123456]`, `mt-[37px]`). Use tokens. If a value repeats twice, make it a token.

## 10. Page-level specs

- **Home:** 8 sections exactly as PRD §9, with the shapes above. Hero right = `DotMatrixStack` + vertical mono timeline (`LATEST BLOCK #…`, `1 MIN AGO #…` computed as `latest − 80`, `1 HOUR AGO #…` as `latest − 4800`, from 0.75s blocks).
- **/launch:** grid of 5 `FolderCard`s. Tab chip = `Guestbook.sol`, cover art = a small `DotMatrix` glyph per template, mono meta `FUNCTIONS: 3 · EST. GAS ~0.00x BOT`, CTA `Use this template →`.
- **/launch/[slug]:** two columns. Left: `Stepper` (vertical, mono `01 Fill · 02 Review · 03 Launch · 04 List`). Right: the step body. The Review step uses `NotchCard` with label `Review`, and tabs inside.
- **/c/[address]:** header ledger (name, template chip, owner AddressPill in lilac if it's you, network badge, explorer link). The `?new=1` SuccessPanel is a lilac-200 band with "Live at 0xAB…" and the action buttons. Below it, the template's Interact UI.
- **/c/[address]/verify:** `LedgerRow` table of settings + `CopyBlock`s + numbered steps.
- **/my:** two ledgers, "Listed" and "Not listed yet (this browser)" with `Register now`.
- **Footer:** PRD §12. Coal-900, `pixel-grid-dark`, status row, link columns, giant `Watermark` cropped at the bottom edge.
