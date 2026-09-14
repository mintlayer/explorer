import { NextResponse } from "next/server";
import { getPoolSummaryData } from "@/lib/explorer-ssr";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET(request: Request) {
  const response = await getPoolSummaryData();

  return NextResponse.json(response, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    },
  });
}
