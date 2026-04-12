import { NextResponse } from "next/server";
import { fetchRecentBlocksFromApi } from "@/lib/explorer-source";
import { getRecentBlocksFromDb, saveRecentBlocksToDb } from "@/lib/explorer-store";

// @ts-ignore
import cache from "@/app/api/_utils/cache";

export const dynamic = "force-dynamic";
export const revalidate = 120;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const before: number | null = searchParams.get("before") ? parseInt(searchParams.get("before") as string) : null;

  const cachedData = cache.get("list" + before);
  if (cachedData) {
    console.log("BLOCK LIST: Returning cached data");
    return NextResponse.json(cachedData, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
      },
    });
  }

  console.log("BLOCK LIST: Gather data");

  const dbBlocks = await getRecentBlocksFromDb(before, 10);
  if (dbBlocks.length === 10 || (!before && dbBlocks.length > 0)) {
    cache.set("list" + before, dbBlocks);
    return NextResponse.json(dbBlocks);
  }

  const response = await fetchRecentBlocksFromApi(before, 10);
  await saveRecentBlocksToDb(response);

  cache.set("list" + before, response);

  return NextResponse.json(response);
}
