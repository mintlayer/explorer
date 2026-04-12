import { NextResponse } from "next/server";
import { fetchNftsFromApi } from "@/lib/explorer-source";
import { getNftsFromDb, saveNftsToDb } from "@/lib/explorer-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const cachedNfts = await getNftsFromDb();
  if (cachedNfts.length > 0) {
    return NextResponse.json(cachedNfts);
  }

  const nfts = await fetchNftsFromApi();
  await saveNftsToDb(nfts);

  return NextResponse.json(nfts);
}
