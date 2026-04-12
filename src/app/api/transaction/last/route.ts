import { NextResponse } from "next/server";
import { fetchRecentTransactionsFromApi } from "@/lib/explorer-source";
import { getRecentTransactionsFromDb, saveRecentTransactionsToDb } from "@/lib/explorer-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = Number(searchParams.get("offset") || 0);

  const cachedTransactions = await getRecentTransactionsFromDb(offset, 10);
  if (cachedTransactions.length === 10 || (offset === 0 && cachedTransactions.length > 0)) {
    return NextResponse.json(cachedTransactions);
  }

  const transactions = await fetchRecentTransactionsFromApi(offset);
  await saveRecentTransactionsToDb(transactions);

  return NextResponse.json(transactions);
}
