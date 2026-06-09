import { ethers } from "ethers";
import { AnalysisResult } from "@/features/contract-analyzer/types";
import {
  AUDIT_REGISTRY_ADDRESS,
  AUDIT_REGISTRY_ABI,
} from "@/core/blockchain";

export async function getRecentAuditsFromSepolia(
  ownerAddress?: string
): Promise<AnalysisResult[]> {
  try {
    const url = ownerAddress
      ? `/api/audits?owner=${encodeURIComponent(ownerAddress.toLowerCase())}`
      : "/api/audits";

    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.warn("Audits API error:", response.status, text);
      return [];
    }

    const audits: AnalysisResult[] = await response.json();
    return audits;
  } catch (error) {
    console.error("Failed to fetch recent audits from Sepolia:", error);
    return [];
  }
}

export async function saveToSepoliaStorageClient(
  contractAddress: string,
  result: AnalysisResult,
  signer: ethers.Signer
): Promise<string> {
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
