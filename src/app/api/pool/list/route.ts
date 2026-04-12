import { NextResponse } from "next/server";
import { fetchAllPoolsFromApi } from "@/lib/explorer-source";
import { getPoolsFromDb, savePoolsToDb } from "@/lib/explorer-store";

export const dynamic = "force-dynamic";
export const revalidate = 120;

export async function GET(request: Request) {
  const cachedPools = await getPoolsFromDb();

  if (cachedPools.length > 0) {
    return NextResponse.json(cachedPools, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
      },
    });
  }

  const pools = await fetchAllPoolsFromApi();
  await savePoolsToDb(pools);

  return NextResponse.json(pools, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    },
  });
}
