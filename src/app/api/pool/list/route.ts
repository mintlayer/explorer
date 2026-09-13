import { NextResponse } from "next/server";
import { getPoolsSnapshot } from "@/lib/explorer-ssr";

export const dynamic = "force-dynamic";
export const revalidate = 120;

export async function GET(request: Request) {
  const pools = await getPoolsSnapshot();

  return NextResponse.json(pools, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    },
  });
}
