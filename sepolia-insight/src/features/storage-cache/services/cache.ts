import { ethers } from "ethers";
import { AnalysisResult } from "@/features/contract-analyzer/types";
import {
  AUDIT_REGISTRY_ADDRESS,
  AUDIT_REGISTRY_ABI,
  SEPOLIA_RPC,
  getAuditRegistryReadOnly,
} from "@/core/blockchain";

export async function getCachedAnalysis(
  contractAddress: string,
  networkId: string
): Promise<AnalysisResult | null> {
  try {
    const registry = getAuditRegistryReadOnly();
    const normalized = contractAddress.toLowerCase();
    return null;
  } catch (error) {
    console.warn(
      "On-chain cache check skipped:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return null;
  }
}

export async function saveToSepoliaStorage(
  contractAddress: string,
  result: AnalysisResult
): Promise<string> {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey === "your_private_key_here") {
    throw new Error("Private key not configured or using placeholder.");
  }

  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
  const signer = new ethers.Wallet(privateKey, provider);
  const ownerAddress = await signer.getAddress();

  const networkId = result.network || "unknown";
  const resolvedAddress = (result.address || contractAddress).toLowerCase();

  const valuePayload = {
    ...result,
    owner: result.owner || ownerAddress.toLowerCase(),
    address: resolvedAddress,
    network: networkId,
    auditDate: result.auditDate || new Date().toISOString(),
  };

  const payloadJson = JSON.stringify(valuePayload);
  const auditHash = ethers.keccak256(ethers.toUtf8Bytes(payloadJson));

  const registry = new ethers.Contract(
    AUDIT_REGISTRY_ADDRESS,
    AUDIT_REGISTRY_ABI,
    signer
  );

  const tx = await registry.storeAudit(auditHash, payloadJson);
  const receipt = await tx.wait();

  return receipt.hash;
}

export async function getAuditsByOwnerFromChain(
  ownerAddress: string
): Promise<AnalysisResult[]> {
  try {
    const registry = getAuditRegistryReadOnly();
    const normalizedOwner = ownerAddress.toLowerCase();

    const hashes: string[] = await registry.getAuditHashesByOwner(normalizedOwner);

    if (!hashes || hashes.length === 0) return [];

    const results = await Promise.all(
      hashes.map(async (hash: string) => {
        try {
          const raw: string = await registry.getAuditData(hash);
          if (!raw) return null;
          const parsed = JSON.parse(raw) as AnalysisResult;
          return { ...parsed, isFromRegistry: true } as AnalysisResult;
        } catch {
          return null;
        }
      })
    );

    const filtered: AnalysisResult[] = [];
    for (const r of results) {
      if (r !== null) filtered.push(r);
    }

    return filtered
      .sort((a, b) => {
        const dateA = a.auditDate ? new Date(a.auditDate).getTime() : 0;
        const dateB = b.auditDate ? new Date(b.auditDate).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 30);
  } catch (error) {
    console.error("Failed to fetch audits from on-chain registry:", error);
    return [];
  }
}
