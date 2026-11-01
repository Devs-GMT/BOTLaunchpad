// Prints the deployer address and balance on the selected network.
//   pnpm -C contracts balance --network botTestnet
import hre from "hardhat";

const { ethers, networkName } = await hre.network.create();
const [deployer] = await ethers.getSigners();
if (!deployer) throw new Error("No deployer: set DEPLOYER_KEY in .env.local");
const balance = await ethers.provider.getBalance(deployer.address);
console.log(`${networkName}  ${deployer.address}  ${ethers.formatEther(balance)} BOT`);
