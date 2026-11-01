import { DEFAULT_LAUNCH_NETWORK } from "@/config/addresses";
import { networks } from "@/config/networks";

/** Live numbers on the home page come from the network people launch on: Testnet until Mainnet has a registry. */
export const liveNetwork = networks[DEFAULT_LAUNCH_NETWORK];
