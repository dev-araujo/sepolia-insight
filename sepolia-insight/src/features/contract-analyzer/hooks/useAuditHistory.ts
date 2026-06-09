"use client";

import { useState, useEffect, useCallback } from "react";
import { ExtendedAnalysisResult } from "./useAnalyzeContract";
import { getRecentAuditsFromSepolia } from "@/features/storage-cache/services/client-cache";

export interface AuditHistoryEntry {
  address: string;
  name?: string;
  network: string;
  date: string;
  riskLevel: string;
  summary: string;
  isFromRegistry?: boolean;
  txHash?: string;
  fullResult?: ExtendedAnalysisResult;
}

export function useAuditHistory() {
  const [history, setHistory] = useState<AuditHistoryEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("sepolia-insight-history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const addToHistory = (
    result: ExtendedAnalysisResult,
    address: string,
    network: string,
    customName?: string,
    txHash?: string
  ) => {
    setHistory((prev) => {
      const existing = prev.find(
        (item) => item.address.toLowerCase() === address.toLowerCase()
      );
      const filtered = prev.filter(
        (item) => item.address.toLowerCase() !== address.toLowerCase()
      );
      const newEntry: AuditHistoryEntry = {
        address,
        name: customName || existing?.name || `Audit ${address.slice(0, 6)}`,
        network,
        date: result.auditDate || new Date().toISOString(),
        riskLevel: result.riskLevel,
        summary: result.summary,
        isFromRegistry: result.isFromRegistry,
        txHash: txHash || existing?.txHash,
        fullResult: result,
      };
      const updated = [newEntry, ...filtered].slice(0, 10);
      localStorage.setItem(
        "sepolia-insight-history",
        JSON.stringify(updated)
      );
      return updated;
    });
  };

  const updateRegistryStatus = (
    address: string,
    customName?: string,
    txHash?: string
  ) => {
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.address.toLowerCase() === address.toLowerCase()
          ? {
              ...item,
              isFromRegistry: true,
              name: customName || item.name,
              txHash: txHash || item.txHash,
              fullResult: item.fullResult
                ? {
                    ...item.fullResult,
                    isFromRegistry: true,
                    address: item.fullResult.address || address,
                  }
                : undefined,
            }
          : item
      );
      localStorage.setItem(
        "sepolia-insight-history",
        JSON.stringify(updated)
      );
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("sepolia-insight-history");
  };

  const syncFromBlockchain = useCallback(async (ownerAddress?: string) => {
    try {
      const audits = await getRecentAuditsFromSepolia(ownerAddress);
      if (audits.length > 0) {
        setHistory((prev) => {
          const newHistory = [...prev];
          audits.forEach((audit) => {
            if (!audit.address) return;
            const existingIdx = newHistory.findIndex(
              (h) =>
                h.address.toLowerCase() === audit.address!.toLowerCase()
            );
            const entry: AuditHistoryEntry = {
              address: audit.address,
              name: `Audit ${audit.address.slice(0, 6)}`,
              network: audit.network || "eth-sepolia",
              date: audit.auditDate || new Date().toISOString(),
              riskLevel: audit.riskLevel,
              summary: audit.summary,
              isFromRegistry: true,
              fullResult: audit,
            };
            if (existingIdx >= 0) {
              newHistory[existingIdx] = {
                ...newHistory[existingIdx],
                ...entry,
                name: newHistory[existingIdx].name || entry.name,
              };
            } else {
              newHistory.push(entry);
            }
          });
          newHistory.sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          const finalHistory = newHistory.slice(0, 20);
          localStorage.setItem(
            "sepolia-insight-history",
            JSON.stringify(finalHistory)
          );
          return finalHistory;
        });
      }
    } catch (e) {
      console.error("Failed to sync from blockchain", e);
    }
  }, []);

  return {
    history,
    addToHistory,
    updateRegistryStatus,
    clearHistory,
    syncFromBlockchain,
  };
}
