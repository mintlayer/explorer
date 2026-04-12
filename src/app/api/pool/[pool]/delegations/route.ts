import { NextResponse } from "next/server";
import { fetchPoolDelegationsFromApi } from "@/lib/explorer-source";
import { getPoolDelegationsFromDb, savePoolDelegationsToDb } from "@/lib/explorer-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ pool: string }> }) {
  const pool = (await params).pool;
  const cachedDelegations = await getPoolDelegationsFromDb(pool);

  if (cachedDelegations.length > 0) {
    return NextResponse.json({ delegations: cachedDelegations });
  }

  const data = await fetchPoolDelegationsFromApi(pool);
  await savePoolDelegationsToDb(pool, data);

  let response: any = {};

  response.delegations = data;

  return NextResponse.json(response);
}
