# BOT Launchpad

Launch your first BOT Chain smart contract in two minutes. Pick a template, fill a short form, confirm in MetaMask. No code, no Remix, and the contract is yours.

**Live:** _tbd_ · **Registry (mainnet):** [`0xE310126CF53AeE93185Aae969a619cb402bEB472`](https://scan.botchain.ai/address/0xE310126CF53AeE93185Aae969a619cb402bEB472)

## Templates

| # | Template | What it does |
|---|---|---|
| 1 | Guestbook | Anyone signs once with a short message |
| 2 | Poll | 2–6 options, one vote per wallet, ends on a date |
| 3 | To-do Board | Shared task list, only you or anyone can add |
| 4 | Tip Jar | Receive BOT tips with notes. Only the owner withdraws. |
| 5 | Event Check-in | Proof of attendance inside a time window, with a cap |

## How it works

1. The browser deploys the template's pre-compiled bytecode with `ethers.ContractFactory` from **your** wallet, so you are the deployer and `owner`.
2. A second, optional transaction lists it in `LaunchpadRegistry`. The registry only accepts contracts whose runtime code hash matches a Launchpad template and whose `owner()` is the caller.
3. Every contract gets an Interact page (`/c/<address>`) and a Verify helper (`/c/<address>/verify`).

Compiled with Solidity **0.8.20**, optimizer **on, 200 runs**, EVM **paris**. Sources are in [`contracts/contracts`](contracts/contracts).

## Safety

Templates are provided as-is. Start on Testnet. Don't use Tip Jar for large amounts. The site never holds funds, never asks for approvals, and charges no fees. You only pay gas.

## Local development

```bash
pnpm install
pnpm dev
pnpm -C contracts test
pnpm -C contracts export       # regenerate src/generated/templates.json
```

Docs: [PRD](PRD.md) · [Build plan](docs/BUILD_PLAN.md) · [Architecture](docs/ARCHITECTURE.md) · [Design system](docs/DESIGN_SYSTEM.md) · [Contracts](docs/CONTRACTS.md)

Built on [BOT Chain](https://botchain.ai).
