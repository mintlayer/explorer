import { get_annual_subsidy } from "@/utils/emission";
import { fetchAllPoolsFromApi, fetchChainTip } from "@/lib/explorer-source";
import { getLatestBlockHeightFromDb, getPoolsFromDb, savePoolsToDb } from "@/lib/explorer-store";
import { sumPoolField } from "@/lib/pool-normalization";
export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let pools = await getPoolsFromDb();

  if (!pools.length) {
    pools = await fetchAllPoolsFromApi();
    await savePoolsToDb(pools, { pruneMissing: true });
  }

  const currentBlockHeight = (await getLatestBlockHeightFromDb()) ?? (await fetchChainTip()).block_height;
  const annual_subsidy = get_annual_subsidy(currentBlockHeight);

  const pools_amount = sumPoolField(pools, "staker_balance");
  const delegations_amount = sumPoolField(pools, "delegations_amount");
  const effective_pools_amount = sumPoolField(pools, "effective_pool_balance");
  const total_amount = sumPoolField(pools, "balance");
  let delegation_count = 0;

  for (const pool of pools) {
    delegation_count += Number.isFinite(pool.delegations_count) ? pool.delegations_count : 0;
  }

  const total_apy = total_amount > 0 ? ((annual_subsidy / total_amount) * 100).toFixed(2) : 0;

  const response = {
    validators_count: pools.length,
    delegation_count: delegation_count,
    pools_amount: pools_amount,
    delegations_amount: delegations_amount,
    total_amount: total_amount,
    total_effective_amount: effective_pools_amount,
    total_apy: total_apy,
    updated_at: Date.now(),
  };

  return new Response(JSON.stringify(response), {
    headers: {
      "Content-Length": encoder.encode(JSON.stringify(response)).byteLength.toString(),
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    },
  });
}
