import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { AnalysisResult, SUPPORTED_NETWORKS } from "../types";
import { AlertTriangle, CheckCircle, Info, Database, Download, ExternalLink, Share2, Lightbulb, Globe, Clock, Hash } from "lucide-react";
import { toast } from "sonner";

interface AnalysisCardProps {
  result: AnalysisResult;
  isSaving?: boolean;
  txHash?: string | null;
  onSave?: () => void;
}

export function AnalysisCard({ result, isSaving, txHash, onSave }: AnalysisCardProps) {
  const networkInfo = SUPPORTED_NETWORKS.find(n => n.id === result.network) || 
                      SUPPORTED_NETWORKS.find(n => n.name.toLowerCase().includes(result.network?.toLowerCase() || ""));

  const getRiskBadge = (level: AnalysisResult["riskLevel"]) => {
    switch (level) {
      case "Low":
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle className="mr-1 h-3 w-3" /> Low Risk</Badge>;
      case "Medium":
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white"><Info className="mr-1 h-3 w-3" /> Medium Risk</Badge>;
      case "High":
        return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-white"><AlertTriangle className="mr-1 h-3 w-3" /> High Risk</Badge>;
    }
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `audit-${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("Audit exported as JSON");
  };

  const copyToClipboard = () => {
    const text = `
Sepolia-Insight Audit Report
-----------------------------
Contract: ${result.address}
Network: ${result.network}
Date: ${result.auditDate ? new Date(result.auditDate).toLocaleString() : 'N/A'}
Risk Level: ${result.riskLevel}
Summary: ${result.summary}
Key Functions: ${result.keyFunctions.join(", ")}
Red Flags: ${result.redFlags.length > 0 ? result.redFlags.join(", ") : "None"}
Suggestions: ${result.suggestions ? result.suggestions.join(", ") : "None"}
Registry Status: ${result.isFromRegistry ? "Saved to Sepolia Blockchain" : "Local Analysis"}
    `.trim();
    navigator.clipboard.writeText(text);
    toast.success("Report copied to clipboard");
  };

  return (
    <Card className="w-full border-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-muted/30">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">Audit Report</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {result.isFromRegistry ? (
              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                <Database className="mr-1 h-3 w-3" /> Permanent Record
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground italic">
                Ephemeral Analysis
              </Badge>
            )}
            {result.network && (
              <Badge variant="secondary" className="capitalize text-[10px]">
                <Globe className="mr-1 h-3 w-3" /> {result.network}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getRiskBadge(result.riskLevel)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-6">
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Hash className="h-3 w-3" /> Contract Address
            </h4>
            <div className="flex items-center gap-2">
              <p className="text-xs font-mono break-all bg-muted/50 p-2 rounded border flex-1">{result.address}</p>
              {networkInfo && (
                <a
                  href={`${networkInfo.explorerUrl}/address/${result.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on Explorer"
                  className="inline-flex items-center justify-center h-8 w-8 shrink-0 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Clock className="h-3 w-3" /> Audit Timestamp
            </h4>
            <p className="text-xs font-medium bg-muted/50 p-2 rounded border" suppressHydrationWarning>
              {result.auditDate ? new Date(result.auditDate).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>

        <section>
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Executive Summary</h4>
          <p className="text-base leading-relaxed text-foreground/90">{result.summary}</p>
        </section>
        
        <section className="grid md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Core Functionalities</h4>
            <ul className="space-y-2">
              {result.keyFunctions.map((fn, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  {fn}
                </li>
              ))}
            </ul>
          </div>

          <div className={`p-4 rounded-lg border ${result.redFlags.length > 0 ? 'bg-red-50/50 border-red-100' : 'bg-green-50/50 border-green-100'}`}>
            <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${result.redFlags.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
              Security & Red Flags
            </h4>
            {result.redFlags.length > 0 ? (
              <ul className="space-y-2">
                {result.redFlags.map((flag, i) => (
                  <li key={i} className="text-sm text-red-700 flex items-start gap-2 font-medium">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {flag}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                No major vulnerabilities identified.
              </p>
            )}
          </div>
        </section>

        {result.suggestions && result.suggestions.length > 0 && (
          <section className="p-4 rounded-lg bg-blue-50/30 border border-blue-100">
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" /> Recommended Improvements
            </h4>
            <ul className="space-y-3">
              {result.suggestions.map((suggestion, i) => (
                <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                  <span className="font-bold text-blue-600 mt-0.5">{i + 1}.</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </section>
        )}

        {txHash && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700 text-xs">
              <Database className="h-4 w-4" />
              <span className="font-mono">TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-blue-700 hover:text-blue-800 hover:bg-blue-100">
              <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                <ExternalLink className="h-3.5 w-3.5 mr-1" /> Explorer
              </a>
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 justify-between border-t pt-4 bg-muted/10">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Share2 className="h-4 w-4 mr-2" /> Copy
          </Button>
          <Button variant="outline" size="sm" onClick={exportToJson}>
            <Download className="h-4 w-4 mr-2" /> JSON
          </Button>
        </div>

        {!result.isFromRegistry && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={onSave} 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Database className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Commit to Blockchain"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
