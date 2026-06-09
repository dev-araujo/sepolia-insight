import { AnalysisResult } from "@/features/contract-analyzer/types";
import { getAuditRegistryReadOnly } from "@/core/blockchain";

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
