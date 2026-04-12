import { NextResponse } from "next/server";
import { fetchPoolDelegationsFromApi, fetchPoolDetailsFromApi } from "@/lib/explorer-source";
import { getPoolDelegationsFromDb, getPoolFromDb, savePoolDelegationsToDb, savePoolsToDb } from "@/lib/explorer-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ pool: string }> }) {
  const pool = (await params).pool;
  const cachedPool = await getPoolFromDb(pool);
  const cachedDelegations = await getPoolDelegationsFromDb(pool);

  if (cachedPool) {
    return NextResponse.json({
      ...cachedPool,
      pool: cachedPool.pool ?? cachedPool.pool_id ?? pool,
      pool_id: cachedPool.pool_id ?? cachedPool.pool ?? pool,
      margin_ratio_percent: cachedPool.margin_ratio_percent ?? cachedPool.margin_ratio_per_thousand,
      pool_balance: cachedPool.pool_balance ?? cachedPool.balance?.toString?.() ?? "0",
      delegations_balance: cachedPool.delegations_balance ?? cachedPool.delegations_amount?.toString?.() ?? "0",
      mark: cachedPool.mark ?? 0,
      delegations_count: cachedPool.delegations_count ?? cachedDelegations.length,
    });
  }

  const response = await fetchPoolDetailsFromApi(pool);

  if (response.error) {
    return NextResponse.json(response, { status: 404 });
  }

  const delegations = cachedDelegations.length ? cachedDelegations : await fetchPoolDelegationsFromApi(pool);
  await Promise.all([savePoolsToDb([response]), savePoolDelegationsToDb(pool, delegations)]);

  return NextResponse.json(response);
}
