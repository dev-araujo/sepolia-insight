import { useState } from "react";
import { AnalysisResult, NetworkType, AIProviderType } from "../types";
import { toast } from "sonner";
import { saveToSepoliaStorageClient } from "@/features/storage-cache/services/client-cache";
import { ethers } from "ethers";

export type ExtendedAnalysisResult = AnalysisResult;

export function useAnalyzeContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<ExtendedAnalysisResult | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const analyze = async (
    address: string,
    network: NetworkType,
    aiProvider: AIProviderType = "groq-llama"
  ) => {
    if (!address.startsWith("0x") || address.length !== 42) {
      toast.error("Invalid Ethereum address");
      return null;
    }

    setIsLoading(true);
    setResult(null);
    setTxHash(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, network, aiProvider }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(
          `Server returned non-JSON response (${response.status}). Check console for details.`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze contract");
      }

      setResult(data);
      if (data.isFromRegistry) {
        toast.info("This audit was retrieved from the Sepolia Registry.");
      } else {
        toast.success("AI Analysis complete!");
      }
      return data;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred during analysis");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const saveToRegistry = async (address: string, signer: ethers.Signer) => {
    if (!result) return;

    setIsSaving(true);
    try {
      const ownerAddress = await signer.getAddress();
      const payload: AnalysisResult = {
        ...result,
        address: result.address || address,
        network: result.network,
        isFromRegistry: true,
        owner: ownerAddress.toLowerCase(),
      };

      const hash = await saveToSepoliaStorageClient(address, payload, signer);

      setTxHash(hash);
      setResult({ ...result, isFromRegistry: true });
      toast.success("Audit saved to Sepolia Registry!");

      return hash;
    } catch (error: any) {
      console.error("Save to Registry Error:", error);
      toast.error(
        error.message ||
          "Failed to save to blockchain. Ensure you have Sepolia ETH."
      );
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    analyze,
    saveToRegistry,
    isLoading,
    isSaving,
    result,
    txHash,
    setResult,
    setTxHash,
  };
}
