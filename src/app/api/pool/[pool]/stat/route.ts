import { NextResponse } from "next/server";
import { fetchPoolStatsFromApi } from "@/lib/explorer-source";
import { getPoolStatsFromDb, getPoolStatsLastUpdatedAt, savePoolStatsToDb } from "@/lib/explorer-store";

export const dynamic = "force-dynamic";

const POOL_STATS_MAX_AGE_MS = Number(process.env.EXPLORER_POOL_STATS_MAX_AGE_MS || 60 * 60 * 1000);

export async function GET(request: Request, { params }: { params: Promise<{ pool: string }> }) {
  const pool = (await params).pool;
  const cachedStats = await getPoolStatsFromDb(pool);
  const lastUpdatedAt = await getPoolStatsLastUpdatedAt(pool);
  const cacheIsFresh =
    Object.keys(cachedStats).length > 0 &&
    lastUpdatedAt !== null &&
    Date.now() - lastUpdatedAt < POOL_STATS_MAX_AGE_MS;

  if (cacheIsFresh) {
    return NextResponse.json(cachedStats);
  }

  try {
    const response = await fetchPoolStatsFromApi(pool);
    await savePoolStatsToDb(pool, response);

    return NextResponse.json(response);
  } catch (error) {
    if (Object.keys(cachedStats).length > 0) {
      return NextResponse.json(cachedStats);
    }

    return NextResponse.json(
      { error: "Failed to fetch block stats" },
      { status: 500 }
    );
  }
}
