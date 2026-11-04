BOT Launchpad — PRD (MVP)


One-liner: Launch your first BOT Chain smart contract in two minutes — pick a template, fill a short form, confirm in MetaMask. No code, no Remix, and the contract is yours.



Category: Productivity · Community · Feasibility: 🟢 Easy · Target build time: ~4.5 hours · Build Week: 3



1. Must-haves (definition of done)


[ ] MetaMask wallet connect — Connect button, short address shown, auto-switch/add BOT Chain mainnet (chain ID 677), with a Testnet toggle (chain ID 968)
[ ] 1 core feature works — Pick a template → fill the form → contract deploys from the user's wallet → registered in the Launchpad Registry → appears in "Recently launched" and its Interact page works
[ ] 5 templates deploy and work on testnet and mainnet (section 3)
[ ] Interact page + Verify helper for every launched contract
[ ] Home page with 5+ sections — 8 sections, see section 9
[ ] Mainnet deployment — Launchpad Registry on BOT Chain mainnet, address in README + footer, visible on scan.botchain.ai
[ ] Live website — Public URL (Vercel + custom domain), works on mobile and desktop
[ ] BOT Chain footer — Clickable BOT Chain logo → botchain.ai + View on explorer → mainnet registry contract (section 12)


2. How it works (Option A · direct deploy)


You (builder), once: write the 5 template contracts, test them, compile them in Remix or Hardhat (Solidity 0.8.20, optimizer on, 200 runs, evmVersion paris unless the BOT Chain docs confirm newer opcodes), and save each template's ABI, bytecode, runtime code hash, source and compiler settings in templates.json.
Users, every time: the website uses ethers.js new ContractFactory(abi, bytecode, signer).deploy(...args) → MetaMask asks to confirm → the contract is created from the user's wallet, so the user is the deployer and owner.
Then register: a second small tx calls LaunchpadRegistry.register(address, templateId, name) so it shows in the feed (users can skip it; the contract still works).
Users never open Remix. An optional [Open in Remix] button exists for people who want to learn or customise.


3. Templates (keep each tiny, no imports, no upgradeability)


Every template has address public owner (set to msg.sender in the constructor), string public name, uint8 public constant TEMPLATE_ID, and no immutables, so every copy of a template has the same runtime code hash.



1 · Guestbook — form: title. Functions: sign(string message) (≤ 140 chars, one per wallet), getEntries(from, count). Use: event guestbook, "I was here".
2 · Poll — form: question, 2–6 options, end date. Functions: vote(uint8 option) (one per wallet, before end), results(), owner close(). Use: community votes.
3 · To-do Board — form: board name, "who can add tasks" (only me / anyone). Functions: addTask(string), toggle(id) (owner or task creator), getTasks(). Use: hackathon team tasks.
4 · Tip Jar — form: name, thank-you message. Functions: tip(string note) payable (min 0.001 BOT), withdraw() owner only (checks-effects-interactions, uses call), getTips(from, count). Use: creator support. The only template that holds BOT.
5 · Event Check-in — form: event name, start/end time, max attendees. Functions: checkIn() (once per wallet, inside the time window, under the cap), attendees(from, count), count(). Use: meetups, workshops (proof of attendance without NFTs).
All templates: events for every action, length caps on strings, custom errors, NatSpec comments; tested with 2 wallets on testnet before saving bytecode.


4. User flow


Step 1 · Choose a template (/launch) — 5 cards with a picture, one-line use case, "Functions: 3", "Est. gas: ~0.00x BOT". [Use this template]
Step 2 · Fill the form — friendly fields only (no Solidity words): e.g. Poll → Question · Options (+ Add option) · Ends on (date/time picker) · Name for the feed. Live validation.
Step 3 · Review — summary card + tabs: Summary · View code (the Solidity with your values highlighted, read-only) · Network (Mainnet / Testnet switch with a note "Try Testnet first — it's free" + faucet link) · estimated gas from estimateGas.
Step 4 · Launch — [Launch on BOT Chain] → MetaMask → progress steps: Waiting for confirmation → Deploying… (tx link) → Live at 0xAB… ✓
Step 5 · Register — [Add to Launchpad feed] → MetaMask (2nd tx) → ✓ Registered. Clear note: "2 quick transactions: one creates your contract, one lists it."
Step 6 · Success page (/c/0xAB…) — address (copy), [View on explorer ↗], [Share], [Open Interact page], [Verify helper], [Launch another].
Step 7 · Interact page (/c/0xAB…) — a simple UI made for that template (vote buttons + live results bar, guestbook wall, to-do list, tip form + tips list, check-in button + attendee count). Anyone can open it from the link.
Step 8 · Verify helper — compiler version, optimizer runs, EVM version, constructor arguments (ABI-encoded, copy), flattened source (copy) + short steps to verify on scan.botchain.ai.
My launches — contracts registered by your wallet (from the registry) + recent deploys in this browser that weren't registered yet ([Register now]).


5. Smart contract — LaunchpadRegistry (Solidity ^0.8.20)


struct Launch { address contractAddr; address owner; uint8 templateId; string name; uint64 at; } (deploy one registry per network)
mapping(uint8 => bytes32) public templateCodeHash; — set in the constructor from templates.json (no admin needed later; a new template set = new registry version)
Launch[] public launches; mapping(address => uint256) public idOf; mapping(address => uint256[]) byOwner; mapping(uint8 => uint256) public countByTemplate;
function register(address c, uint8 templateId, string calldata name) external returns (uint256 id) — requires: c.code.length > 0, c.codehash == templateCodeHash[templateId] (real Launchpad template), IOwned(c).owner() == msg.sender (only the owner can list it), not registered yet, name length cap
Views: getLaunches(from, count), launchesOf(owner), stats() (total + per template), isLaunchpad(address)
event Launched(uint256 indexed id, address indexed contractAddr, address indexed owner, uint8 templateId)
No tokens, no fees, no admin. Note in README: deployment cost is the user's own gas.


6. Tech stack


(Revised: replaces the single index.html plan. Details in docs/ARCHITECTURE.md.)
Next.js (App Router) + TypeScript + Tailwind CSS v4. app/ holds file-based routes only (/, /launch, /launch/[template], /c/[address], /c/[address]/verify, /my); every page renders a module from src/ (sibling folder).
ethers v6 (npm) · TanStack Query for RPC reads · zod + react-hook-form for template forms · shiki (lazy) for the Solidity code view
src/generated/templates.json (ABI, bytecode, code hash, source, settings, deploy gas), generated by a script, never hand-edited
Hosting: Vercel + custom domain (client-rendered, no API routes or server code)
/contracts: a Hardhat (TypeScript) package with the 5 templates + LaunchpadRegistry.sol + tests + export/deploy scripts
Contracts: testnet first (chain ID 968, RPC https://rpc.bohr.life, scan.bohr.life) → mainnet (chain ID 677, RPC https://rpc.botchain.ai, scan.botchain.ai). Both chain IDs verified against the live RPCs on 2026-11-01.
No backend, no AI, no API keys


7. Safety & honesty


Templates are simple and tested, but the site says clearly: "Templates are provided as-is. Start on Testnet. Don't use Tip Jar for large amounts."
Show gas estimates before every tx; never ask for approvals or token permissions
The site never holds funds; Tip Jar funds go only to its owner
Code view shows exactly what will be deployed (same source as the bytecode in templates.json)


8. UI direction (from the Zaro screen recording)


Mood: quiet, precise, technical-premium — warm off-white paper, near-black ink, thin hairline and dashed borders, dot-matrix / pixel graphics, tiny mono labels, one soft lilac highlight, and a deep charcoal section for "security"
Colours (sampled from the recording):
Page off-white #F7F7F5 · navbar #FBFBFB with a 1px hairline border · soft panel #F3F3EE · warm grey panel #E6E5DE · hairlines / dashed boxes #E2E2DE
Ink #191310 (headlines, primary buttons) · second headline line in warm grey #4A4441 (light sections) / #7C7A76 (dark sections) · body grey #9F9D9B · dark text on panels #44423E
Lilac highlight panel #D4D1F9 with darker lilac pill #B0A7F5 (big number badge) and lilac dots #CBC9E6
Charcoal section + footer #211F1B, grid lines #2F2C25, footer watermark #3C3A36
Muted teal button on dark #78A1A6, teal pixels #93CDD7 / #2E5152
Status dots: orange #FD5B13 ("Stale" → our "Old way"), green #67B470 ("Live")
Type: Host Grotesk 500 (free, Google Fonts; the same fallback Zaro's CSS declares for its licensed Saans), tight tracking — hero ~80px, H2 ~44px, with the second line in grey ("You have already bought the AI. / It cannot read your business." pattern); body same family 400; tiny uppercase mono labels with wide tracking (JetBrains Mono) for section kickers ("BUILT WITH"), timelines ("NOW · LAST MONTH"), dates and stats
Buttons: small square-cornered (2–4px radius) — primary near-black with white text + →, secondary white with 1px dark border; on dark: muted teal fill with dark text + →
Navbar: floating full-width white bar inside the page margins with hairline border; logo left (your own flower/dot mark + wordmark), plain text links, "Sign in" text → our "Connect wallet", black [Launch a contract →] on the right
Signature shapes: cards with a notched tab (trapezoid tab on top-left holding a small label, like "Security & Governance") and cards with a cut top-right corner; logo strips in dashed-border boxes; chips with an icon + filename-style label and a mono date on the right
Graphics: isometric layered dot-matrix illustration (stacked translucent planes with lilac/teal/green dots) with a vertical mono timeline beside it; pixel/dot icons (lock, map) on a grid; photo covers with the title in a white label box over the image
Your own logo, mark and art — not Zaro's brand, logo or images
Full tokens, components, shape specs and anti-slop rules: docs/DESIGN_SYSTEM.md


9. Home page (8 sections, following the Zaro recording)


Navbar: your logo · Why Launchpad · Templates · How it works · Verify · Docs ⌄ · right: "Connect wallet" text + black [Launch a contract →]
Section 1 · Hero — left: huge 3-line headline "Your first contract / is one click / away.", grey body "Pick a template, fill a short form, confirm in MetaMask. A real smart contract on BOT Chain, owned by you, in about two minutes.", black [Launch a contract →] + outline [See how it works]. Right: an isometric stack of dot-matrix planes = blocks on BOT Chain (top plane has a lilac cluster = your new contract), with a vertical mono timeline labelled LATEST BLOCK · 1 MIN AGO · 1 HOUR AGO that shows the live block number from the RPC
Section 2 · Built-with strip — hairline-bordered band with two groups in dashed boxes: mono label BUILT WITH → Solidity · ethers.js · MetaMask; mono label RUNS ON → BOT Chain Mainnet · BOT Chain Testnet (simple text/icon chips; only tools you actually use)
Section 3 · The problem — two-tone H2 "You want to build on BOT Chain. / Your first contract takes an afternoon." + 3 photo cards with cut top-right corners and a small icon label on the image: The toolkit. (Remix, compiler, network setup) · The language. (Solidity syntax, errors, tests) · The last mile. (gas, constructor args, verify, a UI) — each with a two-line bold caption + one grey line
Section 4 · Side-by-side demo (like "Stale vs Live") — two-tone H2 "Remix shows you how. / Launchpad does it for you." + grey paragraph; one bordered frame with two panels: left warm grey #E6E5DE with chips Remix + ● Old way (orange dot), title "Deploying by hand.", a white rounded card "Steps: 8" (dashed badge) listing file-chip rows: Install tools · Write Contract.sol · Compile · Add network · Deploy · Copy address · Verify · Build a UI; right lilac #D4D1F9 with chips Launchpad + ● Live (green), title "Launching with a template.", white card "Steps: 3" (lilac pill) with rows Pick a template · Fill the form · Launch and live registry entries with mono times ("POLL · JUST NOW", "GUESTBOOK · 3M AGO"); floating app-icon tiles (your logo + a generic wallet icon)
Section 5 · Launches so far (like the Projects 01–05 chart) — H2 "Your first launch takes minutes. / Your fifth takes seconds." + thin line/bar chart of real launches per template from stats(), mono x-axis labels GUESTBOOK · POLL · TO-DO · TIP JAR · CHECK-IN and a total counter
Section 6 · You own it (charcoal block like "Security & Governance") — dark #211F1B card with a notched tab label "Ownership & Safety"; left: two-tone headline "Owned by you / from the first block." + grey paragraph + teal [Read the templates →]; right: a pixel-dot key/shield on a grid with a small floating label 01 OWN · Your wallet deploys and a mono legend NO APPROVALS · NO FEES · CODE CHECKED — cycling labels 02 VERIFY (code hash checked by the registry) and 03 OPEN (source shown before you launch)
Section 7 · Five things you can launch — centred two-line H2 "Five things / Launchpad can do." + horizontal scrolling photo cards with a small mono category label above (▪ COMMUNITY, ▪ TEAMS, ▪ CREATORS, ▪ EVENTS) and the title in a white label box over the photo: Guestbook · Poll · To-do Board · Tip Jar · Event Check-in → click opens the template
Section 8 · Closing CTA — charcoal band with a dot-matrix world map and grid lines, centred two-tone headline "Find out how fast / you can ship on BOT Chain." + [Launch on Testnet] (teal) + [Launch on Mainnet] (white outline); small FAQ row under it: "Do I need to code?" · "Who owns the contract?" · "What does it cost?" (just gas) · "Why two transactions?" · "Can I verify it?" · "Is it safe?"
Then the footer (section 12).


10. States to handle


No MetaMask → "Install MetaMask" (browsing + code view still work); wrong network → "Switch to BOT Chain Mainnet / Testnet"
Not enough BOT for gas → show estimate + faucet link (testnet) or "Get BOT for gas" link (mainnet)
Form errors: empty name, < 2 poll options, end date in the past, too-long text
Deploy rejected / failed → message + retry; deploy succeeded but register skipped or failed → contract still shown + [Register now] (saved in this browser)
Registry rejects (not owner / unknown code / already registered) → clear explanation
Interact page for an address that isn't a Launchpad contract → "This isn't a Launchpad contract" + explorer link
Poll ended / check-in window closed / max attendees reached / already voted or signed → disabled with reason
Tip Jar empty withdraw → disabled
RPC slow → skeleton loaders; tx pending → step progress with tx link


11. Out of scope (MVP)


Tokens / NFTs / DeFi templates, custom Solidity editing in the browser, in-browser compiling, upgradeable contracts, automatic explorer verification, multi-chain, fees, accounts, backend.



12. Footer (required — creative version)


Concept: Zaro's charcoal footer with the giant watermark wordmark — plus a live "System status" row for BOT Chain.



Charcoal #211F1B background continuing from the closing CTA, faint grid lines and a dotted map corner
Status row (above the link columns, like Zaro's "System Status" link brought to life): green ● Live dot · the BOT Chain logo (white) + "BOT Chain" — clickable → https://botchain.ai (new tab) · mono stats CHAIN ID 677 · BLOCK #12,345,678 (live from the RPC) · CONTRACTS LAUNCHED 128 (from the registry) · registry 0x12ab…9f3c (copy) · teal button [View on explorer →] → https://scan.botchain.ai/address/<MAINNET_CONTRACT_ADDRESS> (new tab)
Link columns in small cream text with white headings: Product (Launch · Templates · My launches · Verify helper) · Resources (BOT Chain docs · Faucet · Explorer · Template source on GitHub) · Support (FAQ · System status · Contact) · Contact (X · GitHub icons) — where Zaro shows its ISO badge, show a small hexagon badge "Built on BOT Chain" (also links to botchain.ai)
Giant watermark: your logo mark + "Launchpad" wordmark spanning the full width at the bottom in #3C3A36 (slightly lighter than the background), cropped by the page edge
Bottom mono row in tiny grey caps: "© 2026 BOT LAUNCHPAD · TEMPLATES PROVIDED AS-IS · START ON TESTNET" + PRIVACY · TERMS
Contract address in one config constant; if the RPC is down the dot turns grey: "RPC not responding"; on mobile the status row wraps into two lines and the columns stack


13. Build plan (~4.5h, original single-file estimate; the Next.js plan with phases and acceptance checks is in docs/BUILD_PLAN.md, ~12h)


0:00–1:15 — Write + test the 5 templates on testnet (2 wallets); compile (0.8.20, optimizer 200, evm paris), export ABI + bytecode + code hashes into templates.json
1:15–1:45 — LaunchpadRegistry with code-hash + owner checks; deploy on testnet; test register with a real and a fake contract
1:45–3:15 — Frontend: template picker, forms, review (code view + gas), deploy + register flow, success page, Interact pages for 5 templates, Verify helper, My launches, states
3:15–4:00 — 8-section home page (dot-matrix hero SVG, side-by-side demo, charcoal block) + watermark footer with status row
4:00–4:20 — Mainnet registry deploy, address constant, GitHub Pages + domain
4:20–4:30 — README, demo clip (pick Poll → fill → launch → register → vote from 2nd wallet), X post tagging @BOTChain_ai


14. Submission checklist


[ ] Mainnet registry contract address
[ ] Live website link
[ ] GitHub repo with /contracts (5 templates + LaunchpadRegistry.sol), templates.json, plain-English README (how templates were compiled, safety note)
[ ] X post with demo clip, tagging @BOTChain_ai