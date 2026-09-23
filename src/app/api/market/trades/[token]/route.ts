import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_MARKET_DATA_API_URL = "http://localhost:3000";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const limit = Math.min(Math.max(Number(new URL(request.url).searchParams.get("limit")) || 100, 1), 1_000);
  const marketDataUrl = (process.env.MARKET_DATA_API_URL || DEFAULT_MARKET_DATA_API_URL).replace(/\/$/, "");

  try {
    const response = await fetch(
      `${marketDataUrl}/trades?quoteAssetId=${encodeURIComponent(token)}&limit=${limit}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      throw new Error(`Market data service returned ${response.status}`);
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load market trades";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
