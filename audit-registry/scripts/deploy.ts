import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying AuditRegistry to Sepolia");
  console.log("   Deployer:", deployer.address);
  console.log("   Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  const AuditRegistry = await ethers.getContractFactory("AuditRegistry");
  const registry = await AuditRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();

  console.log("✅ AuditRegistry deployed!");
  console.log("   Address:", address);
  console.log("");
  console.log("📋 Copy this to your sepolia-insight/.env.local:");
  console.log(`   NEXT_PUBLIC_AUDIT_REGISTRY_ADDRESS=${address}`);
  console.log("");
  console.log("🔍 Verify on Etherscan:");
  console.log(`   npm run verify ${address}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
