import { NextResponse } from "next/server";
import { getUrl } from "@/utils/network";

const NODE_API_URL = getUrl();

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

export async function GET(request: Request, { params }: { params: { pool: string } }) {
  const pool = (await params).pool;
  const currentTime = Math.floor(Date.now() / 1000);

  const dailyStatsPromises = Array.from({ length: 30 }, (_, i) => {
    const dayEnd = currentTime - (i * 86400);
    const dayStart = dayEnd - 86400;

    return fetch(
      `${NODE_API_URL}/pool/${pool}/block-stats?from=${dayStart}&to=${dayEnd}`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then(res => res.json().then(data => ({
      date: new Date(dayStart * 1000).toISOString().split('T')[0], // Format as YYYY-MM-DD
      stats: data
    })));
  });

  try {
    const dailyStats: DailyStatEntry[] = await Promise.all(dailyStatsPromises);

    const response: DailyStats = dailyStats.reduce((acc: DailyStats, { date, stats }: DailyStatEntry) => {
      acc[date] = stats;
      return acc;
    }, {} as DailyStats);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch block stats" },
      { status: 500 }
    );
  }
}
