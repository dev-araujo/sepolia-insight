"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { AnalysisCard } from "@/features/contract-analyzer/components/AnalysisCard";
import { LoadingSkeleton } from "@/features/contract-analyzer/components/LoadingSkeleton";
import { useAnalyzeContract } from "@/features/contract-analyzer/hooks/useAnalyzeContract";
import { useAuditHistory } from "@/features/contract-analyzer/hooks/useAuditHistory";
import { useWeb3 } from "@/core/hooks/useWeb3";
import { NetworkType, SUPPORTED_NETWORKS, AIProviderType, SUPPORTED_PROVIDERS } from "@/features/contract-analyzer/types";
import { Badge } from "@/shared/components/ui/badge";
import { Search, ShieldCheck, Database, Wallet, History, AlertCircle, Tag, Globe, Cpu } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";

export default function Home() {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState<NetworkType>("eth-sepolia");
  const [aiProvider, setAiProvider] = useState<AIProviderType>("groq-llama");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [customName, setCustomName] = useState("");
  const [historyFilter, setHistoryFilter] = useState("");
  
  const { analyze, saveToRegistry, isLoading, isSaving, result, txHash, setResult, setTxHash } = useAnalyzeContract();
  const { history, addToHistory, updateRegistryStatus, syncFromBlockchain } = useAuditHistory();
  const { account, signer, connect, disconnect, isCorrectNetwork, switchToSepolia } = useWeb3();

  useEffect(() => {
    if (account) {
      toast.info("Syncing recent audits from Sepolia registry...");
      syncFromBlockchain(account);
    }
  }, [account, syncFromBlockchain]);

  const handleAnalyze = async (targetAddress?: string, targetNetwork?: NetworkType, name?: string) => {
    const addrToAnalyze = targetAddress || address;
    const netToAnalyze = targetNetwork || network;
    const data = await analyze(addrToAnalyze, netToAnalyze, aiProvider);
    if (data) {
      addToHistory(data, addrToAnalyze, netToAnalyze, name);
    }
  };

  const handleSaveClick = () => {
    if (!account) {
      toast.error("Please connect your wallet first to save to the blockchain.");
      return;
    }
    setCustomName(`Audit ${address.slice(0, 6)}`);
    setIsDialogOpen(true);
  };

  const confirmSave = async () => {
    if (signer && address) {
      setIsDialogOpen(false);
      const hash = await saveToRegistry(address, signer);
      if (hash) {
        updateRegistryStatus(address, customName, hash);
      }
    }
  };

  const resetApp = () => {
    setAddress("");
    setNetwork("eth-sepolia");
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="flex-1 flex flex-col items-center px-4 md:px-8 py-8 max-w-6xl mx-auto w-full space-y-10 relative">
      <header className="w-full flex justify-between items-center">
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={resetApp}
        >
          <div className="p-1.5 bg-primary/5 border border-primary/15 rounded-lg text-primary">
            <ShieldCheck size={18} />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground/80">Sepolia-Insight</span>
        </div>

        {account ? (
          <div className="flex items-center gap-2">
            {!isCorrectNetwork && (
              <Button
                variant="destructive"
                size="sm"
                onClick={switchToSepolia}
                className="gap-1 text-xs h-8"
              >
                <AlertCircle className="h-3 w-3" />
                Switch to Sepolia
              </Button>
            )}
            <Button variant="outline" onClick={disconnect} className="gap-2 border-primary/20 bg-primary/5">
              <div className={`h-2 w-2 rounded-full animate-pulse ${isCorrectNetwork ? 'bg-green-500' : 'bg-red-500'}`} />
              {account.slice(0, 6)}...{account.slice(-4)}
            </Button>
          </div>
        ) : (
          <Button variant="default" onClick={connect} className="gap-2 bg-foreground text-background">
            <Wallet className="h-4 w-4" /> Connect Wallet
          </Button>
        )}
      </header>

      <section className="text-center space-y-5 max-w-2xl mx-auto" >
        <div className="flex justify-center mb-2">
          <div 
            className="p-5 bg-primary/5 border border-primary/20 rounded-3xl text-primary shadow-sm cursor-pointer hover:bg-primary/10 hover:scale-105 transition-all duration-200"
            onClick={resetApp}
          >
            <ShieldCheck size={52} strokeWidth={1.5} />
          </div>
        </div>
        <h1 
          className="text-5xl md:text-7xl font-black tracking-[-0.05em] bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
          onClick={resetApp}
        >
          Sepolia-Insight
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed font-medium">
          Decentralized Audit Registry. Analyze contracts with AI and secure the reports permanently on the Sepolia Testnet.
        </p>
      </section>

      <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
        <div className="flex-1 space-y-8 w-full">
          <section className="w-full bg-card border rounded-2xl p-1 shadow-sm">
            <div className="flex flex-col gap-4 p-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-1.5 w-full">
                  <Label htmlFor="address" className="text-xs font-bold uppercase ml-1 text-muted-foreground">Contract Address</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="address"
                      placeholder="Paste contract address (0x...)"
                      className="pl-10 h-12 bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary/20 font-mono"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
                <Button size="lg" onClick={() => handleAnalyze()} disabled={isLoading || !!result?.address} className="h-12 px-8 font-bold shadow-md active:scale-95 transition-transform w-full md:w-auto">
                  {isLoading ? "Analyzing..." : "Analyze Contract"}
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-tighter ml-1">
                  Select Blockchain Network
                </Label>
                <div className="flex flex-wrap gap-2">
                  {SUPPORTED_NETWORKS.map((n) => (
                    <Button
                      key={n.id}
                      variant={network === n.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNetwork(n.id)}
                      className={`h-9 px-4 rounded-full text-xs transition-all ${
                        network === n.id 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'bg-muted/30 hover:bg-muted/50 border-transparent hover:border-muted-foreground/20'
                      }`}
                    >
                      <Globe className={`h-3 w-3 mr-2 ${network === n.id ? 'animate-pulse' : 'opacity-50'}`} />
                      {n.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mt-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-tighter ml-1">
                  AI Model Provider
                </Label>
                <Select value={aiProvider} onValueChange={(value) => {
                  value && setAiProvider(value as AIProviderType);
                }}>
                  <SelectTrigger className="w-[280px] h-10 bg-muted/20 border-muted-foreground/10 rounded-xl">
                    <SelectValue placeholder="Select an AI Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id} className="rounded-lg">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm flex items-center gap-1.5">
                            <Cpu className="h-3.5 w-3.5 text-primary/70" />
                            {provider.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-5">{provider.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="w-full">
            {isLoading && <LoadingSkeleton />}
            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <AnalysisCard 
                  result={result} 
                  isSaving={isSaving} 
                  txHash={txHash} 
                  onSave={handleSaveClick} 
                />
              </div>
            )}
            {!isLoading && !result && (
              <div className="border-2 border-dashed rounded-3xl p-20 text-center space-y-4 bg-muted/5">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Database className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground font-medium">
                  Audit reports found in the registry will be loaded instantly.
                </p>
              </div>
            )}
          </section>
        </div>
        <aside className="w-full lg:w-80 flex-shrink-0 bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-bold text-sm">Recent Audits</h3>
          </div>

          <div className="p-3 border-b bg-muted/10">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Filter audits..." 
                className="pl-8 h-8 text-xs bg-background/50"
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center mt-10">No recent audits found.</p>
            ) : (
              <div className="space-y-3">
                {history
                  .filter(item => 
                    item.name?.toLowerCase().includes(historyFilter.toLowerCase()) || 
                    item.address.toLowerCase().includes(historyFilter.toLowerCase())
                  )
                  .map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 border rounded-xl hover:bg-muted/50 cursor-pointer transition-colors group ${
                      result?.address?.toLowerCase() === item.address.toLowerCase() ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => {
                      setAddress(item.address);
                      const mappedNetwork = item.network === "mainnet" ? "eth-mainnet" :
                                           item.network === "testnet" ? "eth-sepolia" :
                                           item.network as NetworkType;
                      setNetwork(mappedNetwork);

                      const restoredResult = item.fullResult ?? {
                        summary: item.summary,
                        keyFunctions: [],
                        riskLevel: item.riskLevel as "Low" | "Medium" | "High",
                        redFlags: [],
                        suggestions: [],
                        contractHash: "",
                        address: item.address,
                        network: item.network,
                        auditDate: item.date,
                        isFromRegistry: item.isFromRegistry ?? false,
                      };

                      setResult(restoredResult);
                      setTxHash(item.txHash ?? null);
                      toast.info(`Loaded audit for ${item.name || item.address.slice(0, 8)}`);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-black uppercase text-primary/60">{item.name || 'Untitled Audit'}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        item.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                        item.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {item.address.slice(0, 10)}...{item.address.slice(-4)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">{item.summary}</p>
                    <div className="mt-2 flex items-center justify-between pt-2 border-t border-muted/50">
                      <span className="text-[9px] text-muted-foreground/60" suppressHydrationWarning>{new Date(item.date).toLocaleDateString()}</span>
                      {item.isFromRegistry && <Database className="h-3 w-3 text-blue-500" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </aside>
      </div>

      <footer className="pt-10 text-[10px] text-muted-foreground flex flex-col items-center gap-3 uppercase tracking-[0.2em] w-full border-t border-muted-foreground/10 mt-10 pb-8">
        <div className="flex items-center gap-3">
          <span className="opacity-50">Infrastructure</span>
          <Badge variant="secondary" className="text-[10px] rounded-sm py-0">Sepolia Testnet</Badge>
          <Badge variant="secondary" className="text-[10px] rounded-sm py-0">Groq AI</Badge>
        </div>
        <p className="font-bold">#BuildOnSepolia • Smart Contract Audits</p>
      </footer>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Commit to Sepolia Blockchain
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-2">
              <p>
                Give this audit a name to easily identify it in your history:
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="audit-name" className="text-xs">Audit Name</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="audit-name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="pl-9"
                    placeholder="Enter a name (e.g. My Token Project)"
                  />
                </div>
              </div>
              <Separator />
              <div className="p-3 bg-muted/50 rounded-lg text-sm flex items-start gap-2 border border-muted-foreground/20">
                <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">
                  This report will be saved permanently to Sepolia Testnet. Make sure you are on <strong>Sepolia Testnet</strong> with enough ETH for gas.
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} className="bg-blue-600 hover:bg-blue-700">
              Confirm & Sign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
