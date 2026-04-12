import { NextResponse } from "next/server";
import { fetchPoolStatsFromApi } from "@/lib/explorer-source";
import { getPoolStatsFromDb, savePoolStatsToDb } from "@/lib/explorer-store";

export const dynamic = "force-dynamic";

interface BlockStats {
  block_count: number;
}

interface DailyStats {
  [date: string]: BlockStats;
}

interface DailyStatEntry {
  date: string;
  stats: BlockStats;
}

export async function GET(request: Request, { params }: { params: Promise<{ pool: string }> }) {
  const pool = (await params).pool;
  const cachedStats = await getPoolStatsFromDb(pool);

  try {
    if (Object.keys(cachedStats).length > 0) {
      return NextResponse.json(cachedStats);
    }

    const response = await fetchPoolStatsFromApi(pool);
    await savePoolStatsToDb(pool, response);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch block stats" },
      { status: 500 }
    );
  }
}
