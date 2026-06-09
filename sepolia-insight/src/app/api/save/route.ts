import { NextRequest, NextResponse } from "next/server";
import { saveToSepoliaStorage } from "@/features/storage-cache/services/cache";

export async function POST(req: NextRequest) {
  try {
    const { address, result } = await req.json();

    if (!address || !result) {
      return NextResponse.json(
        { error: "Missing address or analysis result" },
        { status: 400 }
      );
    }

    const txHash = await saveToSepoliaStorage(address, result);
    return NextResponse.json({ txHash });
  } catch (error: any) {
    console.error("Save to Sepolia Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save to blockchain" },
      { status: 500 }
    );
  }
}
