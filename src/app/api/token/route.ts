import { NextResponse } from "next/server";
import { fetchTokensFromApi } from "@/lib/explorer-source";
import { getTokensFromDb, saveTokensToDb } from "@/lib/explorer-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const cachedTokens = await getTokensFromDb();
  if (cachedTokens.length > 0) {
    return NextResponse.json(cachedTokens);
  }

  const tokens = await fetchTokensFromApi();
  await saveTokensToDb(tokens);

  return NextResponse.json(tokens);
}
