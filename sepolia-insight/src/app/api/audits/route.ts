import { NextRequest, NextResponse } from "next/server";
import { getAuditsByOwnerFromChain } from "@/features/storage-cache/services/cache";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerFilter = searchParams.get("owner")?.toLowerCase() || null;

    if (!ownerFilter) {
      return NextResponse.json([]);
    }

    const audits = await getAuditsByOwnerFromChain(ownerFilter);

    return NextResponse.json(audits);
  } catch (error: any) {
    console.error("Audits API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch audits from blockchain" },
      { status: 500 }
    );
  }
}
