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

Deployable template bytecode is **not** taken from Hardhat artifacts. `contracts/scripts/solc.ts` compiles each template on its own with solc-js 0.8.20, from a minimal standard-JSON input:

```jsonc
{
  "language": "Solidity",
  "sources": { "contracts/templates/Poll.sol": { "content": "…" } },
  "settings": { "optimizer": { "enabled": true, "runs": 200 }, "evmVersion": "paris", "outputSelection": { … } }
}
```

Why: the metadata IPFS hash at the end of the bytecode covers the source path, the settings and any remappings. Hardhat compiles templates in one job with the test files and injects a `forge-std` remapping, which would leak into the hash, so nobody could reproduce it on an explorer. With an isolated input that we also hand to the user, explorers recompile the same thing and report a **full match** (confirmed on Blockscout 2026-11-01).

Hardhat (`hardhat.config.ts`, same version/optimizer/EVM) is still used for the tests and for the registry. Changing a template source, the solc version or these settings changes every code hash, which means a **new registry**.

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

The explorers (scan.botchain.ai, scan.bohr.life) are **Blockscout**. For each contract the page shows: compiler `v0.8.20+commit.a1b79de6`, optimizer `enabled, 200 runs`, EVM `paris`, metadata `ipfs`, licence `MIT`, contract name and source path, the **ABI-encoded constructor args** (read back with each template's `readArgs` and encoded in the browser), the **standard-JSON input** as a download (the exact input from §2), and the source. Steps: Contract → Verify & publish → *Solidity (Standard JSON input)* → upload → compiler → contract name → paste args (auto-fetch off) → MIT.

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
| Testnet (968) | [`0x4c6F375aE291886322138a60EaC565978AAb80BC`](https://scan.bohr.life/address/0x4c6F375aE291886322138a60EaC565978AAb80BC) | 2026-11-01, block 28897193 | `0x988012ef…161343d` |
| Mainnet (677) | [`0xE310126CF53AeE93185Aae969a619cb402bEB472`](https://scan.botchain.ai/address/0xE310126CF53AeE93185Aae969a619cb402bEB472) | 2026-11-04, block 29036058 | `0x432d8244…8469154` |

Testnet smoke launches against registry v2 (`pnpm -C contracts smoke --network botTestnet`, 2026-11-01): Guestbook `0xB44ea5a5187c2c61B2F3ADbA5cB2deF796cc1f4A` · Poll `0x7DCba55a0581dc26a4Ddfa22503CB89e45f61343` (fully verified on scan.bohr.life via the Verify helper output) · TodoBoard `0x603631C96c5561e89b58Fdc48742898Bf56eE49B` · TipJar `0x9C1B2262F836C20Eac2371Cf0C9501432aCf77bC` · EventCheckIn `0x05F116Fe56570E0817227f3BB501BF0edd71Bcb6`. Registry rejected wrong id (`CodeMismatch`), relisting (`AlreadyRegistered`), an EOA (`NotAContract`) and a non-owner (`NotOwner`). Register costs ~200–234k gas.

The mainnet address equals the retired testnet v1 registry because both were the deployer's first transaction on their chain (same sender, nonce 0). On testnet that address is stale, so always pair it with a chain id.


## 9. Changelog
- Mainnet (2026-11-04): registry deployed at `0xE310…B472` with the v2 template hashes (1.09M gas, ≈0.022 BOT at 20 gwei). No template changes.
- v2 (2026-11-01): deploy gas Guestbook 637k · Poll 738k · TodoBoard 728k · TipJar 746k · EventCheckIn 586k (≈0.012–0.015 BOT at 20 gwei). Templates compiled in isolation with solc-js and the default `bytecodeHash: ipfs`, so explorer verification is a full match. New testnet registry `0x4c6F…80BC`; contracts launched against v1 (`0xE310…B472`) are no longer recognised as templates.
- v1: initial 5 templates + registry. `bytecodeHash: none` (explorers could only give a partial match). 
