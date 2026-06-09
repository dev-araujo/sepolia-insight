import { NextRequest, NextResponse } from "next/server";
import { fetchContractSourceCode } from "@/features/contract-analyzer/services/etherscan";
import { analyzeContract } from "@/features/contract-analyzer/services/analysis";
import { Web3Address } from "@/features/contract-analyzer/types";

export async function POST(req: NextRequest) {
  try {
    const { address, network, aiProvider } = await req.json();

    if (!address || !network) {
      return NextResponse.json(
        { error: "Missing address or network" },
        { status: 400 }
      );
    }

    const sourceCode = await fetchContractSourceCode(
      address as Web3Address,
      network
    );
    const analysis = await analyzeContract(sourceCode, aiProvider);

    const fullResult = {
      ...analysis,
      address,
      network,
      auditDate: new Date().toISOString(),
      isFromRegistry: false,
    };

    return NextResponse.json(fullResult);
  } catch (error: any) {
    console.error("Analysis API Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal Server Error",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
