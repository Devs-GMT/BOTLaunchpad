import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";

// Fixed compiler settings: every template code hash depends on them.
// Changing anything here requires a new LaunchpadRegistry (docs/CONTRACTS.md §2).
const compiler = {
  version: "0.8.20",
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: "paris",
    // "none": bytecode does not depend on file paths, so explorer verification is an exact match.
    metadata: { bytecodeHash: "none" },
  },
} as const;

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: compiler,
      production: compiler,
    },
  },
  networks: {
    botTestnet: {
      type: "http",
      chainType: "l1",
      chainId: 968,
      url: "https://rpc.bohr.life",
      accounts: [configVariable("DEPLOYER_KEY")],
    },
    botMainnet: {
      type: "http",
      chainType: "l1",
      chainId: 677,
      url: "https://rpc.botchain.ai",
      accounts: [configVariable("DEPLOYER_KEY")],
    },
  },
});
