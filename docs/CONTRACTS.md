# Contracts, Networks & `templates.json`

## 1. Networks (verified against the live RPCs on 2026-11-01)

| | Mainnet | Testnet |
|---|---|---|
| Chain ID | **677** (`0x2a5`) ✔ | **968** (`0x3c8`) ✔ |
| RPC | `https://rpc.botchain.ai` | `https://rpc.bohr.life` |
| Explorer | `https://scan.botchain.ai` | `https://scan.bohr.life` |
| Native currency | BOT, 18 decimals | BOT, 18 decimals |
| Faucet | n/a | `https://faucet.botchain.ai` |
| Client | Geth v1.5.13 (BSC-lineage, PoSA) | same |
| Block time | ~0.75 s (dev docs) | ~0.75 s |

**EVM version.** `eth_call` probes showed `PUSH0` and `TSTORE` working on both networks, and `MCOPY` on mainnet (the testnet MCOPY probe returned no response). We still compile with **`paris`**: it runs everywhere, gives one bytecode for both networks, and the size difference is negligible. Re-evaluate only if a template needs newer opcodes.

Before mainnet launch, check the decimals and whether the explorer verify form is Blockscout- or Etherscan-style. Update §6 to match.

## 2. Compiler settings (fixed)

```ts
solidity: {
  version: '0.8.20',
  settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: 'paris', metadata: { bytecodeHash: 'none' } },
}
```
`bytecodeHash: 'none'` keeps the metadata IPFS hash (which embeds the source path) out of the bytecode, so explorer verification is an exact match whatever the uploaded file is named. The Verify helper shows these exact values, including "Metadata hash: none". Changing any of them changes every code hash, which means a new registry.

## 3. Shared template rules

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/// @title <Template> — BOT Launchpad template #<id>
contract X {
    uint8 public constant TEMPLATE_ID = <id>;
    address public owner;          // storage, NOT immutable (keeps one code hash per template)
    string public name;            // display title, ≤ 64 bytes unless noted
    ...
}
```

- No imports, no inheritance, no `immutable`, no `selfdestruct`, no `delegatecall`, no owner transfer.
- Caps use `bytes(s).length`. The UI counts UTF-8 bytes too (`new TextEncoder().encode(s).length`).
- Pagination: `getX(uint256 from, uint256 count)` returns `[]` when `from >= length` and clamps `count`. The UI requests pages of 20, newest first: the frontend computes `from = max(0, len - page*20)`.
- Common errors: `error EmptyText(); error TextTooLong(uint256 max);`
- Every state change emits an event, and all events index the actor address.

## 4. Template specs

### 1 · Guestbook (`Guestbook.sol`)
| | |
|---|---|
| constructor | `(string name_)`: title, 1–64 bytes |
| storage | `Entry[] entries` (`address signer; uint64 at; string message`), `mapping(address=>bool) hasSigned` |
| writes | `sign(string message)`: 1–140 bytes, once per wallet |
| views | `entryCount()`, `getEntries(from, count) → Entry[]`, `hasSigned(addr)` |
| events | `Signed(uint256 indexed id, address indexed signer)` |
| errors | `AlreadySigned()`, `EmptyText()`, `TextTooLong(140)` |

### 2 · Poll (`Poll.sol`)
| | |
|---|---|
| constructor | `(string question, string[] options_, uint64 endsAt_)`: question 1–120 bytes, 2–6 options of 1–48 bytes each, `endsAt_ > block.timestamp` |
| storage | `string[] options`, `uint256[] votes`, `uint64 endsAt`, `bool closed`, `mapping(address=>bool) hasVoted` |
| writes | `vote(uint8 option)`: once per wallet, while `!closed && block.timestamp < endsAt`. `close()`: owner only |
| views | `getOptions() → string[]`, `results() → uint256[]`, `isOpen() → bool`, `totalVotes()` |
| events | `Voted(address indexed voter, uint8 indexed option)`, `Closed(address indexed by)` |
| errors | `PollClosed()`, `AlreadyVoted()`, `InvalidOption()`, `NotOwner()`, `BadOptions()`, `EndInPast()` |
| note | `name` = question |

### 3 · To-do Board (`TodoBoard.sol`)
| | |
|---|---|
| constructor | `(string name_, bool openToAll_)` |
| storage | `bool openToAll`, `Task[] tasks` (`address creator; bool done; uint64 at; string text`) |
| writes | `addTask(string text)`: 1–120 bytes, owner only unless `openToAll`. `toggle(uint256 id)`: owner or creator |
| views | `taskCount()`, `getTasks(from, count) → Task[]` |
| events | `TaskAdded(uint256 indexed id, address indexed creator)`, `TaskToggled(uint256 indexed id, address indexed by, bool done)` |
| errors | `NotAllowed()`, `NoSuchTask()`, `EmptyText()`, `TextTooLong(120)` |

### 4 · Tip Jar (`TipJar.sol`). The only template that holds BOT.
| | |
|---|---|
| constructor | `(string name_, string thankYou_)`: thankYou ≤ 140 bytes |
| storage | `string thankYou`, `Tip[] tips` (`address from; uint256 amount; uint64 at; string note`), `uint256 totalTipped` |
| constants | `MIN_TIP = 0.001 ether` |
| writes | `tip(string note) payable`: `msg.value >= MIN_TIP`, note ≤ 140 bytes (may be empty). `withdraw()`: owner only, `balance > 0`. CEI: read balance, emit, then `(bool ok,) = owner.call{value: bal}("")` and revert on `!ok` |
| views | `tipCount()`, `getTips(from, count) → Tip[]`, `balance()` |
| events | `Tipped(uint256 indexed id, address indexed from, uint256 amount)`, `Withdrawn(address indexed to, uint256 amount)` |
| errors | `TipTooSmall(uint256 min)`, `NotOwner()`, `NothingToWithdraw()`, `TransferFailed()`, `TextTooLong(140)` |
| note | No `receive`/`fallback`, so plain transfers revert. Funds can only go to `owner`. |

### 5 · Event Check-in (`EventCheckIn.sol`)
| | |
|---|---|
| constructor | `(string name_, uint64 startsAt_, uint64 endsAt_, uint32 maxAttendees_)`: `startsAt_ < endsAt_`, `endsAt_ > block.timestamp`, `1 ≤ max ≤ 10000` |
| storage | `Attendee[] list` (`address who; uint64 at`), `mapping(address=>bool) checkedIn` |
| writes | `checkIn()`: inside `[startsAt, endsAt)`, under the cap, once per wallet |
| views | `count()`, `attendees(from, count) → Attendee[]`, `status() → (bool open, uint256 count, uint32 max)` |
| events | `CheckedIn(uint256 indexed n, address indexed who)` |
| errors | `NotStarted()`, `Ended()`, `Full()`, `AlreadyCheckedIn()`, `BadWindow()`, `BadMax()` |

## 5. LaunchpadRegistry

```solidity
interface IOwned { function owner() external view returns (address); }

contract LaunchpadRegistry {
    struct Launch { address contractAddr; address owner; uint8 templateId; string name; uint64 at; }

    mapping(uint8 => bytes32) public templateCodeHash;   // set once in the constructor
    Launch[] public launches;
    mapping(address => uint256) public idOf;             // 1-based; 0 = not registered
    mapping(address => uint256[]) internal byOwner;
    mapping(uint8 => uint256) public countByTemplate;

    constructor(bytes32[5] memory hashes);               // index 0 → templateId 1

    function register(address c, uint8 templateId, string calldata name) external returns (uint256 id);
    //  reverts: UnknownTemplate · NotAContract · CodeMismatch · NotOwner · AlreadyRegistered · NameTooLong(64)

    function total() external view returns (uint256);
    function getLaunches(uint256 from, uint256 count) external view returns (Launch[] memory);
    function launchesOf(address owner) external view returns (Launch[] memory);
    function stats() external view returns (uint256 total, uint256[5] memory perTemplate);
    function isLaunchpad(address c) external view returns (bool);

    event Launched(uint256 indexed id, address indexed contractAddr, address indexed owner, uint8 templateId);
}
```
No admin, no fees, no tokens, no upgrade path. A new template set means a new registry, and old registries stay readable.

**Tests that must exist:** registering a real template works. A fake contract with an `owner()` returning msg.sender is rejected (`CodeMismatch`). A non-owner trying to register is rejected. Double registration is rejected. An EOA is rejected. Pagination edges (`from >= len`, `count` overflow) behave.

## 6. Verify helper content

For each contract the page shows: compiler `v0.8.20+commit.a1b79de6`, optimizer `enabled, 200 runs`, EVM `paris`, licence `MIT`, contract name, **ABI-encoded constructor args** (computed in the browser with `AbiCoder.encode(constructorTypes, args)`, where args are read back from the contract's public getters or, for a fresh launch, taken from the wizard state), **source** (a single file, so no flattening needed), then 5 short steps for the scan.botchain.ai verify form.

## 7. `src/generated/templates.json` schema

Written by `contracts/scripts/export.ts` after `compile`. The frontend imports it statically.

```jsonc
{
  "version": 1,
  "compiler": { "version": "0.8.20+commit.a1b79de6", "optimizer": { "enabled": true, "runs": 200 }, "evmVersion": "paris", "license": "MIT" },
  "templates": [
    {
      "id": 2,
      "slug": "poll",
      "contractName": "Poll",
      "fileName": "Poll.sol",
      "abi": [ /* full ABI */ ],
      "bytecode": "0x…",                // creation code
      "runtimeCodeHash": "0x…",         // keccak256(deployedBytecode)
      "constructorTypes": ["string", "string[]", "uint64"],
      "functionsCount": 3,              // user-facing writes, shown on the card
      "deployGas": 612345,              // from the gas report on hardhat network
      "source": "// SPDX-License-Identifier: MIT\n…"
    }
  ]
}
```

`src/generated/registry.json` holds only `{ version, abi }` for the registry, so pages that only read stats (home, footer) don't ship template bytecode and sources.

`src/generated/deployments.json` is written by `scripts/deploy-registry.ts`: `{ "<chainId>": { registry, blockNumber, txHash, deployedAt } }`. `src/config/addresses.ts` reads it, so the frontend never hard-codes an address.

`runtimeCodeHash` must equal `keccak256(eth_getCode(deployed))`. The export script asserts this by deploying each template on the Hardhat network and comparing.

## 8. Deployed addresses

| Network | LaunchpadRegistry | Deployed | Tx |
|---|---|---|---|
| Testnet (968) | _tbd_ | | |
| Mainnet (677) | _tbd_ | | |

Seed launches (mainnet), one per template: _tbd_.

## 9. Changelog
- v1: initial 5 templates + registry. `bytecodeHash: none`. Deploy gas on the in-process network: Guestbook 628k · Poll 729k · TodoBoard 719k · TipJar 737k · EventCheckIn 577k (≈0.012–0.015 BOT at 20 gwei).
